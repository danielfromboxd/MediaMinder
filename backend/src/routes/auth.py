from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from ..controllers import auth_controller

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST', 'OPTIONS'])
def register():
    if request.method == 'OPTIONS':
        return '', 200
    return auth_controller.register()

@auth_bp.route('/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return '', 200
    return auth_controller.login()

@auth_bp.route('/verify', methods=['GET'])
@jwt_required()
def verify_token():
    return auth_controller.verify()

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required()
def refresh_token():
    return auth_controller.refresh()