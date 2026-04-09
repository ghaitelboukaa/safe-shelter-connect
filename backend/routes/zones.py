from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity
from models import ZoneRegroupement, PointAffectation, Stocker, Ressource, User, db
from utils.decorators import super_admin_required, admin_required

zones_bp = Blueprint('zones', __name__)

@zones_bp.route('/', methods=['GET'], strict_slashes=False)
def get_zones():
    # Hna n-jibo les zones mn DB
    zones = ZoneRegroupement.query.all()
    zones_list = []
    for zone in zones:
        zones_list.append({
            "id_zone": zone.id_zone,
            "nom_zone": zone.nom_zone,
            "adress_gps": zone.adress_gps,
            "capacite_max": zone.capacite_max,
            "capacite_restante": zone.capacite_restante
        })
    return jsonify(zones_list), 200

@zones_bp.route('/<int:id>', methods=['GET'])
def get_single_zone(id):
    zone = ZoneRegroupement.query.get_or_404(id)
    stocks = Stocker.query.filter_by(id_zone=id).all()
    
    stock_data = []
    for s in stocks:
        res = Ressource.query.get(s.id_ressource)
        stock_data.append({
            "id_ressource": s.id_ressource,
            "type": res.type_ressource,
            "quantite": s.quantite_disponible
        })
        
    return jsonify({
        "zone": {
            "id_zone": zone.id_zone,
            "nom_zone": zone.nom_zone,
            "capacite_restante": zone.capacite_restante
        },
        "stocks": stock_data
    }), 200

# 3. Create Zone (Super Admin Only)
@zones_bp.route('/', methods=['POST'], strict_slashes=False)
@super_admin_required # Hna fin katisti l-role!
def create_zone():
    # ... logic check role admin ...
    data = request.get_json()
    new_zone = ZoneRegroupement(
        nom_zone=data['nom_zone'],
        adress_gps=data['adress_gps'],
        capacite_max=data['capacite_max'],
        capacite_restante=data['capacite_max'] # b l-awal katkun khawya
    )
    db.session.add(new_zone)
    db.session.flush() # N-jibou l-id bla commit l-final

    # Auto-generer l-points d'affectation
    for i in range(new_zone.capacite_max):
        new_point = PointAffectation(
            num_emplacement=f"Z{new_zone.id_zone}-S{i+1}",
            statut='Libre',
            id_zone=new_zone.id_zone
        )
        db.session.add(new_point)

    db.session.commit()
    return jsonify({"message": "Created", "id_zone": new_zone.id_zone}), 201

# 4. Update Zone (Super Admin Only)
@zones_bp.route('/<int:id>', methods=['PUT'])
@super_admin_required # Hna fin katisti l-role!
def update_zone(id):
    zone = ZoneRegroupement.query.get_or_404(id)
    data = request.get_json()
    
    if 'nom_zone' in data: zone.nom_zone = data['nom_zone']
    if 'capacite_max' in data: zone.capacite_max = data['capacite_max']
    if 'capacite_restante' in data: zone.capacite_restante = data['capacite_restante']
    # ... any other fields ...
    
    db.session.commit()
    return jsonify({"message": "Updated"}), 200

@zones_bp.route('/<int:id>', methods=['DELETE'])
@super_admin_required # Hna fin katisti l-role!
def delete_zone(id):
    zone = ZoneRegroupement.query.get_or_404(id)
    db.session.delete(zone)
    db.session.commit()
    return jsonify({"message": "Deleted"}), 200

@zones_bp.route('/<int:id_zone>/stocks', methods=['GET'])
@admin_required
def get_zone_stocks(id_zone):
    # Security check: if standard admin, must be their zone
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if user.role == 'admin' and int(id_zone) != user.id_zone:
        return jsonify({"error": "forbidden", "message": "You can only view stocks in your assigned zone"}), 403

    # 1. Njibou ga3 l-lignat dyal had l-zone mn table 'Stocker'
    stocks = Stocker.query.filter_by(id_zone=id_zone).all()
    
    # 2. Ila makayn hta stock f had l-zone
    if not stocks:
        return jsonify({"message": "No stock available in this zone", "stocks": []}), 200

    stock_list = []
    
    # 3. N-jm3ou l-m3lomat m3a table 'Ressource' bash n-jibou s-miya dyal l-makla/l-ma
    for s in stocks:
        ressource = Ressource.query.get(s.id_ressource)
        if ressource:
            stock_list.append({
                "id_ressource": ressource.id_ressource,
                "type_ressource": ressource.type_ressource,
                "quantite_disponible": s.quantite_disponible,
                "unite_mesure": ressource.unite_mesure
            })

    # 4. N-rj3ou l-JSON nqi l-React/Frontend
    return jsonify({
        "id_zone": id_zone,
        "total_articles": len(stock_list),
        "stocks": stock_list
    }), 200
