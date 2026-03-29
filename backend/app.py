import os
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, verify_jwt_in_request
from sqlalchemy import text
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
from models import Distribuer, Equipe, PointAffectation, db, User, Sinistre,ZoneRegroupement,Ressource,Stocker
from functools import wraps
from flask_cors import CORS

# Chargement des variables d'environnement
load_dotenv()

app = Flask(__name__)
CORS(app)

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

def super_admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if not user or user.role != 'super_admin':
            return jsonify({
                "error": "forbidden",
                "message": "Super Admin access required",
                "status": 403
            }), 403
        return fn(*args, **kwargs)
    return wrapper

def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        # 1. Verify token
        verify_jwt_in_request()
        # 2. Get current user ID mn l-token
        user_id = get_jwt_identity()
        # 3. Qallab 3la l-user f MySQL
        user = User.query.get(user_id)
        
        # 4. Check role (Super Admin can do anything an Admin can)
        if not user or user.role not in ['admin', 'super_admin']:
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
        return jsonify({"message": "Email and Password are required!"}), 400

    # 2. Check wax l-User deja kayn
    user_exists = User.query.filter_by(email=data['email']).first()
    if user_exists:
        return jsonify({"message": "This email is already registered!"}), 400

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
        

        return jsonify({"message": "Account created successfully! You can now login."}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Register error", "error": str(e)}), 500
    


@app.route('/api/v1/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    print(email,password)


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
        return jsonify({"message": "Email or Password is incorrect!"}), 401
    


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

# 3. Create Zone (Super Admin Only)
@app.route('/api/v1/zones', methods=['POST'])
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
@app.route('/api/v1/zones/<int:id>', methods=['PUT'])
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

@app.route('/api/v1/zones/<int:id>', methods=['DELETE'])
@super_admin_required # Hna fin katisti l-role!
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
            "message": "Your profile was not found. You must complete the registration first."
        }), 404
    if sinistre.statut_reservation in ['Pending', 'Confirmed']:
        return jsonify({
            "error": "double_booking", 
            "message": "You already have a reservation or a pending request!", 
            "status": 409
        }),409

    # 2. Check wax l-zone kayna
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
@app.route('/api/v1/reservations/me', methods=['GET'])
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
@app.route('/api/v1/reservations/me', methods=['DELETE'])
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

# Unified Victim Dashboard
@app.route('/api/v1/victim/dashboard', methods=['GET'])
@jwt_required()
def get_victim_dashboard():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    sinistre = Sinistre.query.filter_by(user_id=user_id).first()
    
    # 1. Reservation
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
        
    # 2. Statistics (nearby zones)
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


@app.route('/api/v1/admin/reservations', methods=['GET'])
@admin_required
def list_all_reservations():
    # N-akhdo nmra dyal page mn l-URL (par defaut 1)
    page = request.args.get('page', 1, type=int)
    
    # Security check: if standard admin, filter by their assigned zone
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    query = Sinistre.query.filter(Sinistre.statut_reservation != 'None')
    
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

@app.route('/api/v1/admin/reservations/<int:id>', methods=['PATCH'])
@admin_required
def update_reservation_status(id):
    data = request.get_json()
    action = data.get('action') # Kat-tsnna 'confirm' awla 'reject'
    
    sinistre = Sinistre.query.get_or_404(id)

    # Security check: if standard admin, ensure reservation is in their zone
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
    
    # L-Admin Wafeq
    if action == 'Confirmed':
        sinistre.statut_reservation = 'Confirmed'

        # N-jibou l-id_zone bach n-siftoha l-Procedure mn ba3d
        point = PointAffectation.query.get(sinistre.id_point)
        if point:
            id_zone_for_Procedure = point.id_zone if point else None
        
        response_data = {
            "message": "Status updated", 
            "id_point": sinistre.id_point,
            "statut": "Confirmed"
        }

    # L-Admin Rfed
    elif action == 'Rejected':
        point = PointAffectation.query.get(sinistre.id_point)
        if point:
            # L-blassa trje3 khawya
            point.statut = 'Libre'
            id_zone_for_Procedure = point.id_zone # Hna n-jibou l-id_zone bach n-siftoha l-Procedure mn ba3d
            
            # L-capacite dyal l-zone t-zad (+1) wlakin rah daba drna Procedure ghadi itklf b lhsab
            #zone = ZoneRegroupement.query.get(point.id_zone)
            #if zone:
            #    zone.capacite_restante += 1
        
        # N-m7iw l-lien m3a l-victime
        sinistre.id_point = None
        sinistre.statut_reservation = 'Rejected'
        response_data = {"message": "Reservation rejected, the place has been released"}
    else:
        return jsonify({"error": "bad_request", "message": "Action must be 'Confirmed' or 'Rejected'"}), 400
    
    #  4. HNA FIN KAN-ZIDOU L-APPEL DYAL PROCEDURE BASH N-REFRESHIW L-CAPACITE O LA LISTE DYAL POINTS F KOL ZONE
    if id_zone_for_Procedure:
        sql_call = text("CALL sp_refresh_capacity(:z)")
        db.session.execute(sql_call, {'z': id_zone_for_Procedure})
        
    db.session.commit()
    return jsonify(response_data),200


@app.route('/api/v1/admin/distributions', methods=['POST'])
@admin_required
def record_distribution():
    data = request.get_json()
    
    # N-jibou les IDs li m-connectyin b l-association ternaire
    id_zone = data.get('id_zone')
    id_ressource = data.get('id_ressource')
    id_sinistre = data.get('id_sinistre')
    quantite_donnee = data.get('quantite_donnee')
    unite = data.get('unite_mesure', 'Unit') # Par défaut kg ila masiftouhach

    # 1. Virifier wax kayn had l-stock f table 'Stocker'
    stock = Stocker.query.filter_by(id_zone=id_zone, id_ressource=id_ressource).first()
    
    # Security check: if standard admin, must be their zone
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if user.role == 'admin' and int(id_zone) != user.id_zone:
        return jsonify({"error": "forbidden", "message": "You can only distribute in yourassigned zone"}), 403

    # 2. Error 422 (Insufficient Stock) kima 3ndk f l-lista 5.6
    if not stock or stock.quantite_disponible < quantite_donnee:
        return jsonify({
            "error": "insufficient_stock",
            "message": "Insufficient stock or the resource is not available in this zone!",
            "status": 422
        }), 422

    # 3. Mantiq 1: N-nqso l-Stock
    # stock.quantite_disponible -= quantite_donnee

    # 4. Mantiq 2: N-creerw traçabilité f table 'Distribuer'
    nouvelle_distribution = Distribuer(
        id_zone=id_zone,
        id_ressource=id_ressource,
        id_sinistre=id_sinistre,
        quantite_donnee=quantite_donnee,
        unite_mesure=unite
    )
    db.session.add(nouvelle_distribution)
    
    # 5. Valider kolchi f MySQL
    db.session.commit()

    return jsonify({
        "message": "Distribution recorded",
        "stock_remaining": stock.quantite_disponible
    }), 200

@app.route('/api/v1/resources', methods=['GET'])

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

@app.route('/api/v1/zones/<int:id_zone>/stocks', methods=['GET'])
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

# Partie 5.5: List response teams
@app.route('/api/v1/admin/teams', methods=['GET'])
@admin_required
def list_teams():
    # Kat-jbed mn table 'equipe'
    equipes = Equipe.query.all()
    teams_list = []
    for e in equipes:
        teams_list.append({
            "id_equipe": e.id_equipe,
            "role": e.role,
            "contact": e.contact
        })
    return jsonify({"teams": teams_list}), 200


# Partie 5.5: Summary stats for admin dashboard
@app.route('/api/v1/admin/dashboard', methods=['GET'])
@admin_required
def get_dashboard_summary():
    # Aggregated stats logic
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if user.role == 'admin':
        # Scoped dashboard for specific zone
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

    # 1. Total Zones (For Super Admin)
    total_zones = ZoneRegroupement.query.count()
    
    # ... rest of the logic remains for Super Admin ...
    total_reservations = Sinistre.query.filter(Sinistre.statut_reservation != 'None').count()
    pending = Sinistre.query.filter_by(statut_reservation='Pending').count()
    confirmed = Sinistre.query.filter_by(statut_reservation='Confirmed').count()
    
    # 3. I7sa2iyat dyal Kol Zone (Boucle)
    zones_data = []
    zones = ZoneRegroupement.query.all()
    
    for z in zones:
        # Calcul dyal pourcentage: ((capacite_max - capacite_restante) / capacite_max) * 100
        if z.capacite_max > 0:
            places_occupees = z.capacite_max - z.capacite_restante
            pct_full = round((places_occupees / z.capacite_max) * 100, 1)
        else:
            pct_full = 0
            
        # Check dyal Stock Critique: N-golo mital ila kan 9el mn 50 kg/Litre ra critical
        critical_stock = False
        stocks = Stocker.query.filter_by(id_zone=z.id_zone).all()
        for s in stocks:
            if s.quantite_disponible < 50:  # Seuil d'alerte (Tqder t-bdlo)
                critical_stock = True
                break
                
        zones_data.append({
            "nom_zone": z.nom_zone,
            "pct_full": pct_full,
            "critical_stock": critical_stock
        })
        
    # 4. Return l-JSON kima m-tloub f l-PRD
    return jsonify({
        "total_zones": total_zones,
        "total_reservations": total_reservations,
        "pending": pending,
        "confirmed": confirmed,
        "zones": zones_data
    }), 200

# --- INVENTORY ADDITIONS ---
@app.route('/api/v1/admin/resources', methods=['POST'])
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

@app.route('/api/v1/admin/zones/<int:id_zone>/stocks', methods=['POST'])
@admin_required
def restock_zone(id_zone):
    # Security check: if standard admin, must be their zone
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

# --- TEAM MANAGEMENT ---
@app.route('/api/v1/admin/teams', methods=['POST'])
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

@app.route('/api/v1/admin/teams/<int:id>', methods=['PUT', 'PATCH'])
@admin_required
def update_team(id):
    team = Equipe.query.get_or_404(id)
    data = request.get_json()
    
    if 'role' in data: team.role = data['role']
    if 'contact' in data: team.contact = data['contact']
    if 'id_zone' in data: team.id_zone = data['id_zone']
    
    db.session.commit()
    return jsonify({"message": "Team updated"}), 200

@app.route('/api/v1/admin/teams/<int:id>', methods=['DELETE'])
@admin_required
def delete_team(id):
    team = Equipe.query.get_or_404(id)
    db.session.delete(team)
    db.session.commit()
    return jsonify({"message": "Team deleted"}), 200

# --- USER MANAGEMENT & PROFILES ---
@app.route('/api/v1/admin/users', methods=['POST'])
@super_admin_required
def create_admin_user():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'admin') # Par defaut 'admin'
    id_zone = data.get('id_zone') # Optional but recommended for role='admin'
    
    if User.query.filter_by(email=email).first():
        return jsonify({"message": "User already exists"}), 400
        
    hashed_pw = generate_password_hash(password)
    new_user = User(email=email, password=hashed_pw, role=role, id_zone=id_zone)
    db.session.add(new_user)
    db.session.commit()
    
    zone_msg = f" linked to zone {id_zone}" if id_zone else ""
    return jsonify({"message": f"User with role {role}{zone_msg} created"}), 201

@app.route('/api/v1/admin/victims', methods=['GET'])
@admin_required
def list_victims():
    page = request.args.get('page', 1, type=int)
    pagination = Sinistre.query.paginate(page=page, per_page=10, error_out=False)
    
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

@app.route('/api/v1/profile', methods=['PUT', 'PATCH'])
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