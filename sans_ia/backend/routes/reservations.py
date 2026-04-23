from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import text
from models import Sinistre, PointAffectation, ZoneRegroupement, db

reservations_bp = Blueprint('reservations', __name__)

# A. Create Reservation (POST /reservations)
@reservations_bp.route('/', methods=['POST'], strict_slashes=False)
@jwt_required()
def create_reservation():
    user_id = get_jwt_identity()
    data = request.get_json()
    zone_id = data.get('id_zone')

    # Check if user already has a reservation
    sinistre = Sinistre.query.filter_by(user_id=user_id).first()
    
    # 1. Check wax deja 3ndou talab en cours awla m-confirmé
    if not sinistre:
        return jsonify({
            "error": "profile_not_found", 
            "message": "Your profile was not found. You must complete the registration first."
        }), 404
        
    if sinistre.statut_reservation in ['Pending', 'Confirmed']:
        return jsonify({
            "error": "double_booking", 
            "message": "You already have a reservation or a pending request!", 
            "status": 409
        }), 409

    # 2. Check wax l-zone kayna o wach fiha blassa
    zone = ZoneRegroupement.query.get(zone_id)
    if not zone:
        return jsonify({"error": "not_found", "message": "Zone not found", "status": 404}), 404
        
    if zone.capacite_restante <= 0:
        return jsonify({"error": "zone_full", "message": "This zone is completely full. You cannot reserve a spot here.", "status": 400}), 400

    point = PointAffectation.query.filter_by(id_zone=zone_id, statut='Libre').first()
    if not point:
        return jsonify({"error": "not_found", "message": "No available place in this zone", "status": 404}), 404

    # 3. Blocki l-blassa (bash may-dihach chi wahed akhor f nfs l-weqt)
    point.statut = 'Occup'
    sinistre.id_point = point.id_point
    sinistre.statut_reservation = 'Pending' # L-Admin baqi ma-chafhach

    # 4. N-sauvegardiw l-'Occupé' f MySQL qbel man-7esbou, bash l-Procedure tlqaha
    db.session.flush() # Hadi darori bach n-jibou l-id_point li tbdl f MySQL o n-siftoha l-Procedure

    # 4. Nqas l-capacite dyal l-Zone bsti3mal l-Procedure (CALL sp_refresh_capacity)
    sql_call = text("CALL sp_refresh_capacity(:z)")
    db.session.execute(sql_call, {'z': zone_id})
    db.session.commit()

    return jsonify({
        "message": "Reservation pending", 
        "id_sinistre": sinistre.id_sinistre,
        "point_attribue": point.num_emplacement
    }), 201

# B. View Own Reservation (GET /reservations/me)
@reservations_bp.route('/me', methods=['GET'])
@jwt_required()
def get_my_reservation():
    # 1. Njibou l-ID dyal l-user mn l-token
    user_id = get_jwt_identity()
    sinistre = Sinistre.query.filter_by(user_id=user_id).first()
    
    # 2. Ila makanch 3ndou profile awla baqi ma-reserver walo
    if not sinistre or sinistre.id_point is None:
        return jsonify({"reservation": None, "message": "You currently have no reservation."}), 200
        
    # 3. Njibou m3lomat dyal l-Point o l-Zone bach n-siftohom l-React
    point = PointAffectation.query.get(sinistre.id_point)
    zone = ZoneRegroupement.query.get(point.id_zone) if point else None
    
    # 4. N-rj3ou l-m3lomat nqiya
    return jsonify({
        "reservation": {
            "id_sinistre": sinistre.id_sinistre,
            "statut_reservation": sinistre.statut_reservation,
            "emplacement": point.num_emplacement if point else None,
            "zone": zone.nom_zone if zone else None
        }
    }), 200

# C. Cancel Reservation (DELETE /reservations/me)
@reservations_bp.route('/me', methods=['DELETE'])
@jwt_required()
def cancel_my_reservation():
    user_id = get_jwt_identity()
    sinistre = Sinistre.query.filter_by(user_id=user_id).first()
    
    # 1. Check wax aslan 3ndou reservation
    if not sinistre or sinistre.id_point is None:
        return jsonify({"message": "No reservation found to cancel."}), 404
        
    # 2. Qallab 3la l-blassa (Point) li kan chad
    point = PointAffectation.query.get(sinistre.id_point) 
    id_zone_concernee = None 
    
    if point:
        # 3. Rjje3 l-blassa 'Libre'
        point.statut = 'Libre'
        id_zone_concernee = point.id_zone # Hna n-jibou l-id_zone bach n-siftoha l-Procedure mn ba3d

        # 4. Rjje3 l-capacite l-Zone (+1)
        #zone = ZoneRegroupement.query.get(point.id_zone)
        #if zone:
        #    zone.capacite_restante += 1

    # 5. Mhi l-lien mn l-profile dyal l-victime
    sinistre.id_point = None
    sinistre.statut_reservation = 'Cancelled' # Awla tqder t-khelliha 'Cancelled'
    db.session.flush() # Hadi darori bach n-jibou l-id_point li tbdl f MySQL o n-siftoha l-Procedure

    # 6.N-3ytou l-Procedure bash t-زيد l-blassa f l-hssab dyal capacite_restante
    if id_zone_concernee:
        sql_call = text("CALL sp_refresh_capacity(:z)")
        db.session.execute(sql_call, {'z': id_zone_concernee})
        
    # 7. Enregistrer kolchi f l-base de données
    db.session.commit()
    return jsonify({"message": "Cancelled"}), 200
