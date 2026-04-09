from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import text
from models import Sinistre, PointAffectation, ZoneRegroupement, db

reservations_bp = Blueprint('reservations', __name__)

@reservations_bp.route('/', methods=['POST'], strict_slashes=False)
@jwt_required()
def create_reservation():
    user_id = get_jwt_identity()
    data = request.get_json()
    zone_id = data.get('id_zone')

    sinistre = Sinistre.query.filter_by(user_id=user_id).first()
    
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

    point = PointAffectation.query.filter_by(id_zone=zone_id, statut='Libre').first()
    if not point:
        return jsonify({"error": "not_found", "message": "No available place in this zone", "status": 404}), 404

    point.statut = 'Occup'
    sinistre.id_point = point.id_point
    sinistre.statut_reservation = 'Pending'

    db.session.flush()

    sql_call = text("CALL sp_refresh_capacity(:z)")
    db.session.execute(sql_call, {'z': zone_id})
    db.session.commit()

    return jsonify({
        "message": "Reservation pending", 
        "id_sinistre": sinistre.id_sinistre,
        "point_attribue": point.num_emplacement
    }), 201

@reservations_bp.route('/me', methods=['GET'])
@jwt_required()
def get_my_reservation():
    user_id = get_jwt_identity()
    sinistre = Sinistre.query.filter_by(user_id=user_id).first()
    
    if not sinistre or sinistre.id_point is None:
        return jsonify({"reservation": None, "message": "You currently have no reservation."}), 200
        
    point = PointAffectation.query.get(sinistre.id_point)
    zone = ZoneRegroupement.query.get(point.id_zone) if point else None
    
    return jsonify({
        "reservation": {
            "id_sinistre": sinistre.id_sinistre,
            "statut_reservation": sinistre.statut_reservation,
            "emplacement": point.num_emplacement if point else None,
            "zone": zone.nom_zone if zone else None
        }
    }), 200

@reservations_bp.route('/me', methods=['DELETE'])
@jwt_required()
def cancel_my_reservation():
    user_id = get_jwt_identity()
    sinistre = Sinistre.query.filter_by(user_id=user_id).first()
    
    if not sinistre or sinistre.id_point is None:
        return jsonify({"message": "No reservation found to cancel."}), 404
        
    point = PointAffectation.query.get(sinistre.id_point) 
    id_zone_concernee = None 
    
    if point:
        point.statut = 'Libre'
        id_zone_concernee = point.id_zone

    sinistre.id_point = None
    sinistre.statut_reservation = 'Cancelled'
    db.session.flush()

    if id_zone_concernee:
        sql_call = text("CALL sp_refresh_capacity(:z)")
        db.session.execute(sql_call, {'z': id_zone_concernee})
        
    db.session.commit()
    return jsonify({"message": "Cancelled"}), 200
