from flask import Blueprint
from flask_jwt_extended import jwt_required
from ..controllers.media_controller import get_user_media, add_media_item, update_media_item, delete_media_item

media_bp = Blueprint('media', __name__)

# All endpoints require authentication
media_bp.route('/', methods=['GET'])(jwt_required()(get_user_media))
media_bp.route('/', methods=['POST'])(jwt_required()(add_media_item))
media_bp.route('/<int:item_id>', methods=['PATCH'])(jwt_required()(update_media_item))
media_bp.route('/<int:item_id>', methods=['DELETE'])(jwt_required()(delete_media_item))

@media_bp.route('', methods=['POST'])
@jwt_required()
def add_new_media():
    print("Received POST request to /api/media")
    return add_media_item()

@media_bp.route('', methods=['GET'])
@jwt_required()
def get_all_media():
    print("Received GET request to /api/media")
    return get_user_media()