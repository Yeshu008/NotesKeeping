from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity, get_jwt
from ..models import User
from ..extensions import db
from ..schemas import UserSignUpSchema, UserSignInSchema
from ..utils import validate_json
from ..services.token_blacklist import blacklisted_tokens

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    validated_data, errors = validate_json(UserSignUpSchema, data)
    if errors:
        return jsonify({'error': 'Validation failed', 'details': errors}), 400
    
    if User.query.filter_by(user_email=validated_data.user_email).first():
        return jsonify({'error': 'Email already registered'}), 409
    
    hashed_password = generate_password_hash(validated_data.password)
    new_user = User(
        user_name=validated_data.user_name,
        user_email=validated_data.user_email,
        password=hashed_password
    )
    
    try:
        db.session.add(new_user)
        db.session.commit()
        access_token = create_access_token(identity=new_user.user_id)
        refresh_token = create_refresh_token(identity=new_user.user_id)
        return jsonify({
            'message': 'User created successfully',
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': {
                'user_id': new_user.user_id,
                'user_name': new_user.user_name,
                'user_email': new_user.user_email
            }
        }), 201
    except:
        db.session.rollback()
        return jsonify({'error': 'Failed to create user'}), 500

@auth_bp.route('/signin', methods=['POST'])
def signin():
    data = request.get_json()
    validated_data, errors = validate_json(UserSignInSchema, data)
    if errors:
        return jsonify({'error': 'Validation failed', 'details': errors}), 400
    
    user = User.query.filter_by(user_email=validated_data.user_email).first()
    if not user or not check_password_hash(user.password, validated_data.password):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    access_token = create_access_token(identity=user.user_id)
    refresh_token = create_refresh_token(identity=user.user_id)
    return jsonify({
        'message': 'Login successful',
        'access_token': access_token,
        'refresh_token': refresh_token,
        'user': {
            'user_id': user.user_id,
            'user_name': user.user_name,
            'user_email': user.user_email
        }
    }), 200

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    current_user_id = get_jwt_identity()
    new_access_token = create_access_token(identity=current_user_id)
    return jsonify({'access_token': new_access_token}), 200

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    jti = get_jwt()['jti']
    blacklisted_tokens.add(jti)
    return jsonify({'message': 'Successfully logged out'}), 200
