from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from models import User

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
