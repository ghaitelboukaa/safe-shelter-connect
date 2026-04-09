from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User, Sinistre, PointAffectation, ZoneRegroupement

victim_bp = Blueprint('victim', __name__)

@victim_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_victim_dashboard():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    sinistre = Sinistre.query.filter_by(user_id=user_id).first()
    
    res_data = None
    zone_data = None
    if sinistre and sinistre.id_point:
        point = PointAffectation.query.get(sinistre.id_point)
        zone = ZoneRegroupement.query.get(point.id_zone)
        res_data = {
            "id_sinistre": sinistre.id_sinistre,
            "statut_reservation": sinistre.statut_reservation,
            "emplacement": point.num_emplacement,
            "nom_zone": zone.nom_zone
        }
        zone_data = {
            "nom_zone": zone.nom_zone,
            "adress_gps": zone.adress_gps,
            "id_zone": zone.id_zone
        }
        
    all_zones = ZoneRegroupement.query.all()
    zones_list = []
    for z in all_zones:
        zones_list.append({
            "id_zone": z.id_zone,
            "nom_zone": z.nom_zone,
            "capacite_restante": z.capacite_restante,
            "pct_full": round(((z.capacite_max - z.capacite_restante) / z.capacite_max) * 100, 1) if z.capacite_max > 0 else 0
        })

    return jsonify({
        "profile": {
            "nom": sinistre.nom if sinistre else None,
            "prenom": sinistre.prenom if sinistre else None,
            "email": user.email
        },
        "reservation": res_data,
        "zone_assigned": zone_data,
        "available_zones": zones_list
    }), 200
