from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity
from werkzeug.security import generate_password_hash
from sqlalchemy import text
from models import Sinistre, PointAffectation, db, User, ZoneRegroupement, Distribuer, Stocker, Ressource, Equipe
from utils.decorators import admin_required, super_admin_required

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/reservations', methods=['GET'])
@admin_required
def list_all_reservations():
    page = request.args.get('page', 1, type=int)
    search_query = request.args.get('q', '').strip()
    
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    query = Sinistre.query.filter(Sinistre.statut_reservation.isnot(None))
    
    if search_query:
        query = query.filter(
            db.or_(
                Sinistre.nom.ilike(f'%{search_query}%'),
                Sinistre.prenom.ilike(f'%{search_query}%'),
                Sinistre.cin.ilike(f'%{search_query}%'),
                (Sinistre.nom + " " + Sinistre.prenom).ilike(f"%{search_query}%"),
                (Sinistre.prenom + " " + Sinistre.nom).ilike(f"%{search_query}%")
            )
        )
    
    if user.role == 'admin':
        if not user.id_zone:
             return jsonify({"error": "unauthorized", "message": "Admin not assigned to any zone"}), 403
        query = query.join(PointAffectation).filter(PointAffectation.id_zone == user.id_zone)
    
    pagination = query.paginate(page=page, per_page=10, error_out=False)
    
    reservations_list = []
    for r in pagination.items:
        point = PointAffectation.query.get(r.id_point) if r.id_point else None
        zone_name = ZoneRegroupement.query.get(point.id_zone).nom_zone if point else None
        
        reservations_list.append({
            "id_sinistre": r.id_sinistre,
            "nom_complet": f"{r.nom} {r.prenom}",
            "cin": r.cin,
            "statut": r.statut_reservation,
            "point_attribue": point.num_emplacement if point else None,
            "zone": zone_name
        })
        
    return jsonify({
        "reservations": reservations_list,
        "total": pagination.total,
        "page": pagination.page
    }), 200

@admin_bp.route('/reservations/<int:id>', methods=['PATCH'])
@admin_required
def update_reservation_status(id):
    data = request.get_json()
    action = data.get('action')
    
    sinistre = Sinistre.query.get_or_404(id)

    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if user.role == 'admin':
        point_check = PointAffectation.query.get(sinistre.id_point) if sinistre.id_point else None
        if not point_check or point_check.id_zone != user.id_zone:
            return jsonify({"error": "forbidden", "message": "You can only manage reservations in your assigned zone"}), 403

    if sinistre.statut_reservation != 'Pending':
        return jsonify({"error": "bad_request", "message": "This reservation is not in the Pending state"}), 400

    id_zone_for_Procedure = None
    response_data = {}
    
    if action == 'Confirmed':
        sinistre.statut_reservation = 'Confirmed'
        point = PointAffectation.query.get(sinistre.id_point)
        if point:
            id_zone_for_Procedure = point.id_zone if point else None
        
        response_data = {
            "message": "Status updated", 
            "id_point": sinistre.id_point,
            "statut": "Confirmed"
        }

    elif action == 'Rejected':
        point = PointAffectation.query.get(sinistre.id_point)
        if point:
            point.statut = 'Libre'
            id_zone_for_Procedure = point.id_zone 
            
        sinistre.id_point = None
        sinistre.statut_reservation = 'Rejected'
        response_data = {"message": "Reservation rejected, the place has been released"}
    else:
        return jsonify({"error": "bad_request", "message": "Action must be 'Confirmed' or 'Rejected'"}), 400
    
    if id_zone_for_Procedure:
        sql_call = text("CALL sp_refresh_capacity(:z)")
        db.session.execute(sql_call, {'z': id_zone_for_Procedure})
        
    db.session.commit()
    return jsonify(response_data), 200

@admin_bp.route('/distributions', methods=['POST'])
@admin_required
def record_distribution():
    data = request.get_json()
    
    id_zone = data.get('id_zone')
    id_ressource = data.get('id_ressource')
    id_sinistre = data.get('id_sinistre')
    quantite_donnee = data.get('quantite_donnee')
    unite = data.get('unite_mesure', 'Unit')

    stock = Stocker.query.filter_by(id_zone=id_zone, id_ressource=id_ressource).first()
    
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if user.role == 'admin' and int(id_zone) != user.id_zone:
        return jsonify({"error": "forbidden", "message": "You can only distribute in yourassigned zone"}), 403

    if not stock or stock.quantite_disponible < quantite_donnee:
        return jsonify({
            "error": "insufficient_stock",
            "message": "Insufficient stock or the resource is not available in this zone!",
            "status": 422
        }), 422

    nouvelle_distribution = Distribuer(
        id_zone=id_zone,
        id_ressource=id_ressource,
        id_sinistre=id_sinistre,
        quantite_donnee=quantite_donnee,
        unite_mesure=unite
    )
    db.session.add(nouvelle_distribution)
    db.session.commit()

    return jsonify({
        "message": "Distribution recorded",
        "stock_remaining": stock.quantite_disponible
    }), 200

@admin_bp.route('/dashboard', methods=['GET'])
@admin_required
def get_dashboard_summary():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if user.role == 'admin':
        if not user.id_zone:
             return jsonify({"error": "unauthorized", "message": "Admin not assigned to any zone"}), 403
        
        zone = ZoneRegroupement.query.get(user.id_zone)
        total_reservations = Sinistre.query.join(PointAffectation).filter(PointAffectation.id_zone == user.id_zone, Sinistre.statut_reservation != 'None').count()
        pending = Sinistre.query.join(PointAffectation).filter(PointAffectation.id_zone == user.id_zone, Sinistre.statut_reservation == 'Pending').count()
        confirmed = Sinistre.query.join(PointAffectation).filter(PointAffectation.id_zone == user.id_zone, Sinistre.statut_reservation == 'Confirmed').count()
        
        places_occupees = zone.capacite_max - zone.capacite_restante
        pct_full = round((places_occupees / zone.capacite_max) * 100, 1) if zone.capacite_max > 0 else 0
        
        critical_stock = False
        stocks = Stocker.query.filter_by(id_zone=user.id_zone).all()
        for s in stocks:
            if s.quantite_disponible < 50:
                critical_stock = True
                break
        
        return jsonify({
            "scope": "zone",
            "nom_zone": zone.nom_zone,
            "total_reservations": total_reservations,
            "pending": pending,
            "confirmed": confirmed,
            "pct_full": pct_full,
            "critical_stock": critical_stock
        }), 200

    total_zones = ZoneRegroupement.query.count()
    
    total_reservations = Sinistre.query.filter(Sinistre.statut_reservation != 'None').count()
    pending = Sinistre.query.filter_by(statut_reservation='Pending').count()
    confirmed = Sinistre.query.filter_by(statut_reservation='Confirmed').count()
    
    zones_data = []
    zones = ZoneRegroupement.query.all()
    
    for z in zones:
        if z.capacite_max > 0:
            places_occupees = z.capacite_max - z.capacite_restante
            pct_full = round((places_occupees / z.capacite_max) * 100, 1)
        else:
            pct_full = 0
            
        critical_stock = False
        stocks = Stocker.query.filter_by(id_zone=z.id_zone).all()
        for s in stocks:
            if s.quantite_disponible < 50:  
                critical_stock = True
                break
                
        zones_data.append({
            "nom_zone": z.nom_zone,
            "pct_full": pct_full,
            "critical_stock": critical_stock
        })
        
    return jsonify({
        "total_zones": total_zones,
        "total_reservations": total_reservations,
        "pending": pending,
        "confirmed": confirmed,
        "zones": zones_data
    }), 200

@admin_bp.route('/resources', methods=['POST'])
@admin_required
def create_resource():
    data = request.get_json()
    new_res = Ressource(
        type_ressource=data.get('type_ressource'),
        unite_mesure=data.get('unite_mesure')
    )
    db.session.add(new_res)
    db.session.commit()
    return jsonify({"message": "Resource created", "id_ressource": new_res.id_ressource}), 201

@admin_bp.route('/zones/<int:id_zone>/stocks', methods=['POST'])
@admin_required
def restock_zone(id_zone):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if user.role == 'admin' and int(id_zone) != user.id_zone:
        return jsonify({"error": "forbidden", "message": "You can only restock in your assigned zone"}), 403

    data = request.get_json()
    id_ressource = data.get('id_ressource')
    quantite = data.get('quantite')
    
    stock = Stocker.query.filter_by(id_zone=id_zone, id_ressource=id_ressource).first()
    if stock:
        stock.quantite_disponible += float(quantite)
    else:
        stock = Stocker(id_zone=id_zone, id_ressource=id_ressource, quantite_disponible=float(quantite))
        db.session.add(stock)
        
    db.session.commit()
    return jsonify({"message": "Stock updated successfully", "new_quantity": stock.quantite_disponible}), 200

@admin_bp.route('/teams', methods=['GET'])
@admin_required
def list_teams():
    equipes = Equipe.query.all()
    teams_list = []
    for e in equipes:
        teams_list.append({
            "id_equipe": e.id_equipe,
            "role": e.role,
            "contact": e.contact
        })
    return jsonify({"teams": teams_list}), 200

@admin_bp.route('/teams', methods=['POST'])
@admin_required
def create_team():
    data = request.get_json()
    new_team = Equipe(
        role=data.get('role'),
        contact=data.get('contact'),
        id_zone=data.get('id_zone')
    )
    db.session.add(new_team)
    db.session.commit()
    return jsonify({"message": "Team created", "id_equipe": new_team.id_equipe}), 201

@admin_bp.route('/teams/<int:id>', methods=['PUT', 'PATCH'])
@admin_required
def update_team(id):
    team = Equipe.query.get_or_404(id)
    data = request.get_json()
    
    if 'role' in data: team.role = data['role']
    if 'contact' in data: team.contact = data['contact']
    if 'id_zone' in data: team.id_zone = data['id_zone']
    
    db.session.commit()
    return jsonify({"message": "Team updated"}), 200

@admin_bp.route('/teams/<int:id>', methods=['DELETE'])
@admin_required
def delete_team(id):
    team = Equipe.query.get_or_404(id)
    db.session.delete(team)
    db.session.commit()
    return jsonify({"message": "Team deleted"}), 200

@admin_bp.route('/users', methods=['POST'])
@super_admin_required
def create_admin_user():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'admin') 
    id_zone = data.get('id_zone') 
    
    if User.query.filter_by(email=email).first():
        return jsonify({"message": "User already exists"}), 400
        
    hashed_pw = generate_password_hash(password)
    new_user = User(email=email, password=hashed_pw, role=role, id_zone=id_zone)
    db.session.add(new_user)
    db.session.commit()
    
    zone_msg = f" linked to zone {id_zone}" if id_zone else ""
    return jsonify({"message": f"User with role {role}{zone_msg} created"}), 201

@admin_bp.route('/users', methods=['GET'])
@super_admin_required
def list_admin_users():
    admins = User.query.filter(User.role.in_(['admin', 'super_admin'])).all()
    result = []
    for u in admins:
        zone_name = None
        if u.id_zone:
            zone = ZoneRegroupement.query.get(u.id_zone)
            zone_name = zone.nom_zone if zone else None
        result.append({
            "id_user": u.id_user,
            "email": u.email,
            "role": u.role,
            "id_zone": u.id_zone,
            "zone_name": zone_name
        })
    return jsonify({"users": result, "total": len(result)}), 200

@admin_bp.route('/victims', methods=['GET'])
@admin_required
def list_victims():
    page = request.args.get('page', 1, type=int)
    search_query = request.args.get('q', '').strip()
    
    query = Sinistre.query
    if search_query:
        query = query.filter(
            db.or_(
                Sinistre.nom.ilike(f'%{search_query}%'),
                Sinistre.prenom.ilike(f'%{search_query}%'),
                Sinistre.cin.ilike(f'%{search_query}%'),
                (Sinistre.nom + " " + Sinistre.prenom).ilike(f"%{search_query}%"),
                (Sinistre.prenom + " " + Sinistre.nom).ilike(f"%{search_query}%")
            )
        )
    
    pagination = query.paginate(page=page, per_page=10, error_out=False)
    
    victims = []
    for v in pagination.items:
        victims.append({
            "id_sinistre": v.id_sinistre,
            "nom": v.nom,
            "prenom": v.prenom,
            "cin": v.cin,
            "statut_reservation": v.statut_reservation
        })
    return jsonify({"victims": victims, "total": pagination.total, "page": pagination.page}), 200
