from flask import Blueprint
from ..controllers import user

user_bp = Blueprint('user', __name__)

@user_bp.route('/profile', methods=['GET'])
def get_profile():
    return user.get_profile()

@user_bp.route('/profile', methods=['PUT'])
def update_profile():
    return user.update_profile()

@user_bp.route('/account', methods=['DELETE'])
def delete_account():
    return user.delete_account()