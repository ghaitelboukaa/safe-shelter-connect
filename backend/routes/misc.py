from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Ressource, Sinistre, User, ZoneRegroupement, Equipe, Mission, db

misc_bp = Blueprint('misc', __name__)

@misc_bp.route('/resources', methods=['GET'])
def list_resources():
    ressources = Ressource.query.all()
    res_list = []
    for r in ressources:
        res_list.append({
            "id_ressource": r.id_ressource,
            "type_ressource": r.type_ressource,
            "unite_mesure": r.unite_mesure
        })
    return jsonify({"resources": res_list}), 200

@misc_bp.route('/profile', methods=['PUT', 'PATCH'])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    sinistre = Sinistre.query.filter_by(user_id=user_id).first()
    if not sinistre:
        return jsonify({"message": "Profile not found"}), 404
        
    if 'nom' in data: sinistre.nom = data['nom']
    if 'prenom' in data: sinistre.prenom = data['prenom']
    if 'cin' in data: sinistre.cin = data['cin']
    
    db.session.commit()
    return jsonify({"message": "Profile updated"}), 200

@misc_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    current_user = get_jwt_identity()
    return jsonify(logged_in_as=current_user), 200

@misc_bp.route('/search', methods=['GET'])
@jwt_required()
def global_search():
    query = request.args.get('q', '').strip()
    if not query:
        return jsonify({"results": []}), 200

    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    results = []

    zones = ZoneRegroupement.query.filter(ZoneRegroupement.nom_zone.ilike(f'%{query}%')).all()
    for z in zones:
        results.append({
            "type": "zone",
            "id": z.id_zone,
            "label": z.nom_zone,
            "sublabel": z.adress_gps,
            "link": "/admin/zones" if user.role in ['admin', 'super_admin'] else "/victim/portal"
        })

    if user.role in ['admin', 'super_admin', 'equipe']:
        victims = Sinistre.query.filter(
            (Sinistre.nom.ilike(f'%{query}%')) | 
            (Sinistre.prenom.ilike(f'%{query}%')) | 
            (Sinistre.cin.ilike(f'%{query}%'))
        ).all()
        for v in victims:
            results.append({
                "type": "victim",
                "id": v.id_sinistre,
                "label": f"{v.prenom} {v.nom}",
                "sublabel": f"CIN: {v.cin}",
                "link": "/admin/victims"
            })

        teams = Equipe.query.filter(Equipe.role.ilike(f'%{query}%')).all()
        for t in teams:
            results.append({
                "type": "team",
                "id": t.id_equipe,
                "label": t.role,
                "sublabel": f"Contact: {t.contact}",
                "link": "/admin/teams"
            })

        resources = Ressource.query.filter(Ressource.type_ressource.ilike(f'%{query}%')).all()
        for r in resources:
            results.append({
                "type": "logistics",
                "id": r.id_ressource,
                "label": r.type_ressource,
                "sublabel": "Inventory Resource",
                "link": "/admin/logistics"
            })

        missions = Mission.query.filter(
            (Mission.titre.ilike(f'%{query}%')) | 
            (Mission.description.ilike(f'%{query}%'))
        ).all()
        for m in missions:
            results.append({
                "type": "mission",
                "id": m.id_mission,
                "label": m.titre,
                "sublabel": f"Statut: {m.statut}",
                "link": "/admin/missions"
            })

    return jsonify({"results": results}), 200
