from flask import request, jsonify
from flask_jwt_extended import create_access_token
from datetime import timedelta
from ..models.db import db
from ..models.user import User

def register():
    data = request.get_json()
    print(f"Registration request received: {data}")
    
    # Validate input
    required_fields = ['username', 'email', 'password']
    if not all(field in data for field in required_fields):
        print("Missing required fields")
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Check if user already exists
    if User.query.filter_by(email=data['email']).first():
        print(f"Email {data['email']} already exists")
        return jsonify({'error': 'Email already registered'}), 409
    
    if User.query.filter_by(username=data['username']).first():
        print(f"Username {data['username']} already exists")
        return jsonify({'error': 'Username already taken'}), 409
    
    # Create new user
    new_user = User(
        username=data['username'],
        email=data['email']
    )
    new_user.set_password(data['password'])
    
    # Save to database
    db.session.add(new_user)
    db.session.commit()
    
    # Generate access token
    access_token = create_access_token(
        identity=new_user.id,
        additional_claims={'username': new_user.username},
        expires_delta=timedelta(days=1)
    )
    
    return jsonify({
        'message': 'User registered successfully',
        'token': access_token,
        'user': new_user.to_dict()
    }), 201

def login():
    data = request.get_json()
    print(f"Login request received: {data}")
    
    # Validate input
    if 'email' not in data or 'password' not in data:
        return jsonify({'error': 'Email and password required'}), 400
    
    # Find user
    user = User.query.filter_by(email=data['email']).first()
    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    # Generate access token
    access_token = create_access_token(
        identity=user.id,
        additional_claims={'username': user.username},
        expires_delta=timedelta(days=1)
    )
    
    return jsonify({
        'message': 'Login successful',
        'token': access_token,
        'user': user.to_dict()
    }), 200