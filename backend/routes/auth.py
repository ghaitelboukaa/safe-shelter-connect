from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required
from models import User, Sinistre, db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if not data.get('email') or not data.get('password'):
        return jsonify({"message": "Email and Password are required!"}), 400

    user_exists = User.query.filter_by(email=data['email']).first()
    if user_exists:
        return jsonify({"message": "This email is already registered!"}), 400

    try:
        hashed_password = generate_password_hash(data['password'])

        new_user = User(
            email=data['email'],
            password=hashed_password,
            role='sinistre'
        )
        db.session.add(new_user)
        db.session.commit()

        if new_user.role == 'sinistre':
            new_sinistre = Sinistre(
            nom=data.get('nom'),
            prenom=data.get('prenom'),
            cin=data.get('cin'),
            user_id=new_user.id_user 
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

    user = User.query.filter_by(email=email).first()

    if user and check_password_hash(user.password, password):
        access_token = create_access_token(identity=str(user.id_user))
        
        return jsonify({
            "message": "Login successful!",
            "access_token": access_token,
            "role": user.role,
            "id_zone": user.id_zone
        }), 200
    else:
        return jsonify({"message": "Email or Password is incorrect!"}), 401

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    return jsonify({"message": "Logged out"}), 200
