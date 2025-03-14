from flask import request, jsonify
from flask_jwt_extended import get_jwt_identity
from sqlalchemy.exc import SQLAlchemyError
from ..models.db import db
from ..models.user import User
from ..models.media import Media
from ..models.user_media import UserMedia

def get_user_media():
    user_id = get_jwt_identity()
    print(f"\n\n===== GET USER MEDIA =====")
    print(f"USER ID: {user_id}")
    
    # Get all user_media records with their related media
    try:
        user_media_items = UserMedia.query.filter_by(user_id=user_id).all()
        print(f"✅ FOUND {len(user_media_items)} ITEMS")
        
        # Debug each item
        for item in user_media_items:
            print(f"📦 ITEM {item.id}: Media ID {item.media_id}, Status: {item.status}")
            print(f"   Media: {item.media.title} ({item.media.type})")
        
        result = [item.to_dict() for item in user_media_items]
        print(f"📤 RETURNING {len(result)} ITEMS")
        return jsonify(result), 200
        
    except Exception as e:
        print(f"❌ ERROR GETTING USER MEDIA: {str(e)}")
        import traceback
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

def add_media_item():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    print("\n\n===== ADD MEDIA REQUEST =====")
    print(f"USER ID: {user_id}")
    print(f"REQUEST DATA: {data}")
    print("RAW REQUEST CONTENT:")
    print(request.data)
    print("REQUEST HEADERS:")
    print(request.headers)
    
    # Validation - ensure required fields are present
    required_fields = ['media_id', 'media_type', 'status']
    if not all(field in data for field in required_fields):
        print(f"Missing required fields. Got: {list(data.keys())}")
        return jsonify({"error": "Missing required fields"}), 400
    
    try:
        # Check if media already exists in our database
        media = Media.query.filter_by(external_id=data['media_id']).first()
        
        # If media doesn't exist, create it
        if not media:
            # Make sure we have a title or get one from the API
            if 'title' not in data:
                print("Missing title in request")
                return jsonify({"error": "Title is required when adding new media"}), 400
                
            media = Media(
                external_id=data['media_id'],
                type=data['media_type'],
                title=data['title'],
                image_url=data.get('poster_path', '')
            )
            db.session.add(media)
            db.session.commit()
            print(f"Created new media: {media.id} - {media.title}")
        
        # Check if user already has this media in their list
        existing_user_media = UserMedia.query.filter_by(
            user_id=user_id,
            media_id=media.id
        ).first()
        
        if existing_user_media:
            # Update status if it already exists
            existing_user_media.status = data['status']
            db.session.commit()
            print(f"Updated status to {data['status']} for media {media.id}")
            return jsonify(existing_user_media.to_dict()), 200
        else:
            # Create new user_media entry
            user_media = UserMedia(
                user_id=user_id,
                media_id=media.id,
                status=data['status']
            )
            db.session.add(user_media)
            db.session.commit()
            print(f"Added new user_media: {user_media.id} with status {data['status']}")
            return jsonify(user_media.to_dict()), 201
            
    except Exception as e:
        print(f"Error adding media: {str(e)}")
        import traceback
        traceback.print_exc()
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

def update_media_item(item_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    
    # Find user_media item
    user_media = UserMedia.query.filter_by(id=item_id, user_id=user_id).first()
    if not user_media:
        return jsonify({'error': 'Media item not found'}), 404
    
    # Update fields
    allowed_fields = ['status', 'rating', 'review']
    for field in allowed_fields:
        if field in data:
            setattr(user_media, field, data[field])
    
    # Save changes
    db.session.commit()
    
    return jsonify({
        'message': 'Media item updated successfully',
        'item': user_media.to_dict()
    }), 200

def delete_media_item(item_id):
    user_id = get_jwt_identity()
    
    # Find user_media item
    user_media = UserMedia.query.filter_by(id=item_id, user_id=user_id).first()
    if not user_media:
        return jsonify({'error': 'Media item not found'}), 404
    
    # Delete item
    db.session.delete(user_media)
    db.session.commit()
    
    return jsonify({'message': 'Media item deleted successfully'}), 200