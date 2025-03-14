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
    
    # NEW: Echo the raw request content
    print("RAW REQUEST CONTENT:")
    print(request.data)
    print("REQUEST HEADERS:")
    print(request.headers)
    
    # Validate input
    required_fields = ['media_id', 'title', 'media_type', 'status']
    if not all(field in data for field in required_fields):
        print(f"❌ MISSING FIELDS! Got: {data.keys()}")
        return jsonify({'error': 'Missing required fields'}), 400
    
    try:
        # Check if media exists in our database by external ID
        media = Media.query.filter_by(external_id=str(data['media_id']), type=data['media_type']).first()
        
        # If media doesn't exist, create it
        if not media:
            print(f"➕ CREATING NEW MEDIA: {data['title']} ({data['media_type']})")
            media = Media(
                external_id=str(data['media_id']),
                type=data['media_type'],
                title=data['title'],
                image_url=data.get('poster_path')
            )
            db.session.add(media)
            db.session.flush()  # Get ID without committing
            print(f"✅ CREATED MEDIA WITH ID: {media.id}")
        else:
            print(f"🔍 FOUND EXISTING MEDIA: {media.title} (ID: {media.id})")
        
        # Check if user already tracks this media
        existing = UserMedia.query.filter_by(user_id=user_id, media_id=media.id).first()
        if existing:
            print(f"⚠️ USER {user_id} ALREADY TRACKS MEDIA {media.id}")
            return jsonify({'error': 'Media already in your list'}), 409
        
        # Create new user_media entry
        print(f"➕ CREATING USER_MEDIA FOR USER {user_id}, MEDIA {media.id}, STATUS {data['status']}")
        user_media = UserMedia(
            user_id=user_id,
            media_id=media.id,
            status=data['status'],
            rating=data.get('rating')
        )
        
        db.session.add(user_media)
        db.session.commit()
        print(f"✅ CREATED USER_MEDIA WITH ID: {user_media.id}")
        
        # Debug the result
        result = user_media.to_dict()
        print(f"📤 RETURNING: {result}")
        
        # Return with complete data for frontend
        return jsonify({
            'message': 'Media added successfully',
            'item': result
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ ERROR ADDING MEDIA: {str(e)}")
        print(f"ERROR TYPE: {type(e).__name__}")
        import traceback
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

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