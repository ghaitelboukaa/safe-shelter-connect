from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required
from models import User, Sinistre, db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
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
        if new_user.role == 'sinistre':
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

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    print(email, password)

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
            "role": user.role,
            "id_zone": user.id_zone
        }), 200
    else:
        # Ila kan error f email aw password
        return jsonify({"message": "Email or Password is incorrect!"}), 401

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    # Hna tqder t-zid logic dyal blacklist ila bghiti amn ktar
    return jsonify({"message": "Logged out"}), 200
