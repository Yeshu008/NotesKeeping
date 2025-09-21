from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, create_refresh_token, get_jwt_identity, get_jwt
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from pydantic import BaseModel, EmailStr, ValidationError
from datetime import datetime, timedelta
import uuid
import os
from typing import Optional

app = Flask(__name__)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'mysql://root:password@localhost/notesapp')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)

# Initialize extensions
db = SQLAlchemy(app)
jwt = JWTManager(app)
CORS(app, origins=['http://localhost:3000'])

# Token blacklist for logout
blacklisted_tokens = set()

@jwt.token_in_blocklist_loader
def check_if_token_revoked(jwt_header, jwt_payload):
    jti = jwt_payload['jti']
    return jti in blacklisted_tokens

# Database Models
class User(db.Model):
    __tablename__ = 'users'
    
    user_id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_name = db.Column(db.String(100), nullable=False)
    user_email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    last_update = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_on = db.Column(db.DateTime, default=datetime.utcnow)
    
    notes = db.relationship('Note', backref='user', lazy=True, cascade='all, delete-orphan')

class Note(db.Model):
    __tablename__ = 'notes'
    
    note_id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    note_title = db.Column(db.String(200), nullable=False)
    note_content = db.Column(db.Text, nullable=True)
    last_update = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_on = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.String(36), db.ForeignKey('users.user_id'), nullable=False)

# Pydantic Schemas for validation
class UserSignUpSchema(BaseModel):
    user_name: str
    user_email: EmailStr
    password: str
    
    class Config:
        str_strip_whitespace = True

class UserSignInSchema(BaseModel):
    user_email: EmailStr
    password: str
    
    class Config:
        str_strip_whitespace = True

class NoteCreateSchema(BaseModel):
    note_title: str
    note_content: Optional[str] = ""
    
    class Config:
        str_strip_whitespace = True

class NoteUpdateSchema(BaseModel):
    note_title: Optional[str] = None
    note_content: Optional[str] = None
    
    class Config:
        str_strip_whitespace = True

# Helper function for validation
def validate_json(schema, data):
    try:
        return schema(**data), None
    except ValidationError as e:
        return None, e.errors()

# Routes
@app.route('/api/auth/signup', methods=['POST'])
def signup():
    data = request.get_json()
    
    # Validate input
    validated_data, errors = validate_json(UserSignUpSchema, data)
    if errors:
        return jsonify({'error': 'Validation failed', 'details': errors}), 400
    
    # Check if user already exists
    if User.query.filter_by(user_email=validated_data.user_email).first():
        return jsonify({'error': 'Email already registered'}), 409
    
    # Create new user
    hashed_password = generate_password_hash(validated_data.password)
    new_user = User(
        user_name=validated_data.user_name,
        user_email=validated_data.user_email,
        password=hashed_password
    )
    
    try:
        db.session.add(new_user)
        db.session.commit()
        
        # Create tokens
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
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to create user'}), 500

@app.route('/api/auth/signin', methods=['POST'])
def signin():
    data = request.get_json()
    
    # Validate input
    validated_data, errors = validate_json(UserSignInSchema, data)
    if errors:
        return jsonify({'error': 'Validation failed', 'details': errors}), 400
    
    # Find user
    user = User.query.filter_by(user_email=validated_data.user_email).first()
    
    if not user or not check_password_hash(user.password, validated_data.password):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    # Create tokens
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

@app.route('/api/auth/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    current_user_id = get_jwt_identity()
    new_access_token = create_access_token(identity=current_user_id)
    return jsonify({'access_token': new_access_token}), 200

@app.route('/api/auth/logout', methods=['POST'])
@jwt_required()
def logout():
    jti = get_jwt()['jti']
    blacklisted_tokens.add(jti)
    return jsonify({'message': 'Successfully logged out'}), 200

@app.route('/api/notes', methods=['GET'])
@jwt_required()
def get_notes():
    current_user_id = get_jwt_identity()
    notes = Note.query.filter_by(user_id=current_user_id).order_by(Note.last_update.desc()).all()
    
    return jsonify({
        'notes': [{
            'note_id': note.note_id,
            'note_title': note.note_title,
            'note_content': note.note_content,
            'last_update': note.last_update.isoformat(),
            'created_on': note.created_on.isoformat()
        } for note in notes]
    }), 200

@app.route('/api/notes', methods=['POST'])
@jwt_required()
def create_note():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validate input
    validated_data, errors = validate_json(NoteCreateSchema, data)
    if errors:
        return jsonify({'error': 'Validation failed', 'details': errors}), 400
    
    # Create new note
    new_note = Note(
        note_title=validated_data.note_title,
        note_content=validated_data.note_content,
        user_id=current_user_id
    )
    
    try:
        db.session.add(new_note)
        db.session.commit()
        
        return jsonify({
            'message': 'Note created successfully',
            'note': {
                'note_id': new_note.note_id,
                'note_title': new_note.note_title,
                'note_content': new_note.note_content,
                'last_update': new_note.last_update.isoformat(),
                'created_on': new_note.created_on.isoformat()
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to create note'}), 500

@app.route('/api/notes/<note_id>', methods=['GET'])
@jwt_required()
def get_note(note_id):
    current_user_id = get_jwt_identity()
    note = Note.query.filter_by(note_id=note_id, user_id=current_user_id).first()
    
    if not note:
        return jsonify({'error': 'Note not found'}), 404
    
    return jsonify({
        'note': {
            'note_id': note.note_id,
            'note_title': note.note_title,
            'note_content': note.note_content,
            'last_update': note.last_update.isoformat(),
            'created_on': note.created_on.isoformat()
        }
    }), 200

@app.route('/api/notes/<note_id>', methods=['PUT'])
@jwt_required()
def update_note(note_id):
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validate input
    validated_data, errors = validate_json(NoteUpdateSchema, data)
    if errors:
        return jsonify({'error': 'Validation failed', 'details': errors}), 400
    
    # Find note
    note = Note.query.filter_by(note_id=note_id, user_id=current_user_id).first()
    
    if not note:
        return jsonify({'error': 'Note not found'}), 404
    
    # Update note
    if validated_data.note_title is not None:
        note.note_title = validated_data.note_title
    if validated_data.note_content is not None:
        note.note_content = validated_data.note_content
    
    try:
        db.session.commit()
        
        return jsonify({
            'message': 'Note updated successfully',
            'note': {
                'note_id': note.note_id,
                'note_title': note.note_title,
                'note_content': note.note_content,
                'last_update': note.last_update.isoformat(),
                'created_on': note.created_on.isoformat()
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update note'}), 500

@app.route('/api/notes/<note_id>', methods=['DELETE'])
@jwt_required()
def delete_note(note_id):
    current_user_id = get_jwt_identity()
    note = Note.query.filter_by(note_id=note_id, user_id=current_user_id).first()
    
    if not note:
        return jsonify({'error': 'Note not found'}), 404
    
    try:
        db.session.delete(note)
        db.session.commit()
        
        return jsonify({'message': 'Note deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to delete note'}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message': 'API is running'}), 200

# Create tables
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)