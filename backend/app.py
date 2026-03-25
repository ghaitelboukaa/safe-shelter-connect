import os
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, verify_jwt_in_request
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
from models import PointAffectation, db, User, Sinistre,ZoneRegroupement,Ressource,Stocker
from functools import wraps

# Chargement des variables d'environnement
load_dotenv()

app = Flask(__name__)

# Configuration MySQL mn .env
db_user = os.getenv('DB_USER')
db_password = os.getenv('DB_PASSWORD')
db_host = os.getenv('DB_HOST')
db_name = os.getenv('DB_NAME')

app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+pymysql://{db_user}:{db_password}@{db_host}/{db_name}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')

db.init_app(app)
jwt = JWTManager(app)

def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        # 1. Verify token
        verify_jwt_in_request()
        # 2. Get current user ID mn l-token
        user_id = get_jwt_identity()
        # 3. Qallab 3la l-user f MySQL
        user = User.query.get(user_id)
        
        # 4. Check role
        if not user or user.role != 'admin':
            return jsonify({
                "error": "forbidden",
                "message": "Valid token but insufficient role",
                "status": 403
            }), 403
            
        return fn(*args, **kwargs)
    return wrapper 

# --- ROUTES AUTHENTICATION ---
@app.route('/')
def home():
    return "Bienvenue dans le système de gestion des sinistres!"

@app.route('/api/v1/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # 1. Validation sghira
    if not data.get('email') or not data.get('password'):
        return jsonify({"message": "Email o Password daroriyn!"}), 400

    # 2. Check wax l-User deja kayn
    user_exists = User.query.filter_by(email=data['email']).first()
    if user_exists:
        return jsonify({"message": "Had l-email deja m-stajjal!"}), 400

    try:
        # 3. Hash dyal Password (Security)
        hashed_password = generate_password_hash(data['password'])

        # 4. Création dyal User
        new_user = User(
            email=data['email'],
            password=hashed_password,
            role='sinistre'
        )
        db.session.add(new_user)
        db.session.commit()

        # 5. Création dyal Profile Sinistre (Victime)
        # Hna kantsstakhdmou l-m3lomat li sifti f SQL
        if new_user.role  == 'sinistre':
            new_sinistre = Sinistre(
            nom=data.get('nom'),
            prenom=data.get('prenom'),
            cin=data.get('cin'),
            user_id=new_user.id_user # L-lien bin l-compte o l-personne
            )
            db.session.add(new_sinistre)
            db.session.commit()
        

        return jsonify({"message": "Compte  t-creea mzyan! Daba tqder t-login."}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Erreur f l-Register", "error": str(e)}), 500
    


@app.route('/api/v1/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    # 1. N-qalbo 3la l-user f l-DB b l-email
    user = User.query.filter_by(email=email).first()

    # 2. Check wax l-user kayn o wax password s-hih
    if user and check_password_hash(user.password, password):
        
        # 3. Kreina l-Token (fih l-id o l-role dyal user)
        # Hna identity tqder tkhliha ghir id_user
        access_token = create_access_token(identity=str(user.id_user))
        
        return jsonify({
            "message": "Login successful!",
            "access_token": access_token,
            "role": user.role
        }), 200
    
    else:
        # Ila kan error f email aw password
        return jsonify({"message": "Email awla Password ghalat!"}), 401
    


@app.route('/api/v1/zones', methods=['GET'])
#@jwt_required()# Darori t-koun m-login bach tchof hadchi
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

@app.route('/api/v1/zones/<int:id>', methods=['GET'])
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

# 3. Create Zone (Admin Only)
@app.route('/api/v1/zones', methods=['POST'])
@jwt_required()
@admin_required # Hna fin katisti l-role!
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
    db.session.commit()
    return jsonify({"message": "Created", "id_zone": new_zone.id_zone}), 201

# 4. Update Zone (Admin Only)
@app.route('/api/v1/zones/<int:id>', methods=['PUT'])
@jwt_required()
@admin_required # Hna fin katisti l-role!
def update_zone(id):
    zone = ZoneRegroupement.query.get_or_404(id)
    data = request.get_json()
    
    if 'nom_zone' in data: zone.nom_zone = data['nom_zone']
    if 'capacite_max' in data: zone.capacite_max = data['capacite_max']
    if 'capacite_restante' in data: zone.capacite_restante = data['capacite_restante']
    # ... any other fields ...
    
    db.session.commit()
    return jsonify({"message": "Updated"}), 200

@app.route('/api/v1/zones/<int:id>', methods=['DELETE'])
@jwt_required()
@admin_required # Hna fin katisti l-role!
def delete_zone(id):
    zone = ZoneRegroupement.query.get_or_404(id)
    db.session.delete(zone)
    db.session.commit()
    return jsonify({"message": "Deleted"}), 200


# A. Create Reservation (POST /reservations)
@app.route('/api/v1/reservations', methods=['POST'])
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
            "message": "Ma-lqinach l-profile dyalk. Khassk ddir Register kamil."
        }), 404
    if sinistre.statut_reservation in ['Pending', 'Confirmed']:
        return jsonify({
            "error": "double_booking", 
            "message": "Deja 3ndk reservation awla talab en cours!", 
            "status": 409
        }),409

    # 2. Check wax l-zone kayna
    point = PointAffectation.query.filter_by(id_zone=zone_id, statut='Libre').first()
    if not point:
        return jsonify({"error": "not_found", "message": "Makaynch blassa khawya f had l-zone", "status": 404}), 404

    # 3. Blocki l-blassa (bash may-dihach chi wahed akhor f nfs l-weqt)
    point.statut = 'Occup'
    sinistre.id_point = point.id_point
    sinistre.statut_reservation = 'Pending' # L-Admin baqi ma-chafhach

    # 4. Nqas l-capacite dyal l-Zone
    zone = ZoneRegroupement.query.get(zone_id)
    if zone:
        zone.capacite_restante -= 1

    db.session.commit()

    return jsonify({
        "message": "Reservation pending", 
        "id_sinistre": sinistre.id_sinistre,
        "point_attribue": point.num_emplacement
    }), 201

# B. View Own Reservation (GET /reservations/me)
@app.route('/api/v1/reservations/me', methods=['GET'])
@jwt_required()
def get_my_reservation():
    # 1. Njibou l-ID dyal l-user mn l-token
    user_id = get_jwt_identity()
    sinistre = Sinistre.query.filter_by(user_id=user_id).first()
    # 2. Ila makanch 3ndou profile awla baqi ma-reserver walo
    if not sinistre or sinistre.id_point is None:
        return jsonify({"reservation": None, "message": "Ma3ndk hta reservation daba."}), 200
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
@app.route('/api/v1/reservations/me', methods=['DELETE'])
@jwt_required()
def cancel_my_reservation():
    user_id = get_jwt_identity()
    sinistre = Sinistre.query.filter_by(user_id=user_id).first()
    # 1. Check wax aslan 3ndou reservation
    if not sinistre or sinistre.id_point is None:
        return jsonify({"message": "Makayn hta reservation bach t-annuler."}), 404
    # 2. Qallab 3la l-blassa (Point) li kan chad
    point = PointAffectation.query.get(sinistre.id_point)  
    if point:
        # 3. Rjje3 l-blassa 'Libre'
        point.statut = 'Libre'
        # 4. Rjje3 l-capacite l-Zone (+1)
        zone = ZoneRegroupement.query.get(point.id_zone)
        if zone:
            zone.capacite_restante += 1
    # 5. Mhi l-lien mn l-profile dyal l-victime
    sinistre.id_point = None
    sinistre.statut_reservation = 'Cancelled' # Awla tqder t-khelliha 'Cancelled'
    # 6. Enregistrer kolchi f l-base de données
    db.session.commit()
    return jsonify({"message": "Cancelled"}), 200


@app.route('/api/v1/admin/reservations', methods=['GET'])
@jwt_required()
@admin_required
def list_all_reservations():
    # N-akhdo nmra dyal page mn l-URL (par defaut 1)
    page = request.args.get('page', 1, type=int)
    
    # N-jibou ghir nass li aslan darou reservation (machi 'None')
    # Pagination: 10 dyal nass f kol page
    pagination = Sinistre.query.filter(Sinistre.statut_reservation != 'None').paginate(page=page, per_page=10, error_out=False)
    
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

@app.route('/api/v1/admin/reservations/<int:id>', methods=['PATCH'])
@jwt_required()
@admin_required
def update_reservation_status(id):
    data = request.get_json()
    action = data.get('action') # Kat-tsnna 'confirm' awla 'reject'
    
    sinistre = Sinistre.query.get_or_404(id)

    if sinistre.statut_reservation != 'Pending':
        return jsonify({"error": "bad_request", "message": "Had reservation machi f l-etat Pending"}), 400

    # L-Admin Wafeq
    if action == 'Confirmed':
        sinistre.statut_reservation = 'Confirmed'
        db.session.commit()
        return jsonify({
            "message": "Status updated", 
            "id_point": sinistre.id_point,
            "statut": "Confirmed"
        }), 200

    # L-Admin Rfed
    elif action == 'Rejected':
        point = PointAffectation.query.get(sinistre.id_point)
        if point:
            # L-blassa trje3 khawya
            point.statut = 'Libre'
            
            # L-capacite dyal l-zone t-zad (+1)
            zone = ZoneRegroupement.query.get(point.id_zone)
            if zone:
                zone.capacite_restante += 1
        
        # N-m7iw l-lien m3a l-victime
        sinistre.id_point = None
        sinistre.statut_reservation = 'Rejected'
        db.session.commit()
        return jsonify({"message": "Reservation rejected, l-blassa rj3at khawya"}), 200
    
    return jsonify({"error": "bad_request", "message": "Action khassha t-koun 'Confirmed' awla 'Rejected'"}), 400






# 1. Refresh Token: Bach l-user may-t-disconnectach dima
#@app.route('/api/v1/auth/refresh', methods=['POST'])
#@jwt_required(refresh=True)
#def refresh():
 #   current_user = get_jwt_identity()
  #  new_access_token = create_access_token(identity=current_user)
   # return jsonify({"access_token": new_access_token}), 200

# 2. Logout: Revoke token
@app.route('/api/v1/auth/logout', methods=['POST'])
@jwt_required()
def logout():
    # Hna tqder t-zid logic dyal blacklist ila bghiti amn ktar
    return jsonify({"message": "Logged out"}), 200



# Route de test pour voir si le token marche
@app.route('/api/v1/profile', methods=['GET'])
@jwt_required()
def get_profile():
    current_user = get_jwt_identity()
    return jsonify(logged_in_as=current_user), 200





   

if __name__ == '__main__':
    app.run(debug=True)