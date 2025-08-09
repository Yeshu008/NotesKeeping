from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import Note
from ..extensions import db
from ..schemas import NoteCreateSchema, NoteUpdateSchema
from ..utils import validate_json

note_bp = Blueprint('notes', __name__)

@note_bp.route('/notes', methods=['GET'])
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

@note_bp.route('/notes', methods=['POST'])
@jwt_required()
def create_note():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    validated_data, errors = validate_json(NoteCreateSchema, data)
    if errors:
        return jsonify({'error': 'Validation failed', 'details': errors}), 400
    
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
    except:
        db.session.rollback()
        return jsonify({'error': 'Failed to create note'}), 500

@note_bp.route('/notes/<note_id>', methods=['GET'])
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

@note_bp.route('/notes/<note_id>', methods=['PUT'])
@jwt_required()
def update_note(note_id):
    current_user_id = get_jwt_identity()
    data = request.get_json()
    validated_data, errors = validate_json(NoteUpdateSchema, data)
    if errors:
        return jsonify({'error': 'Validation failed', 'details': errors}), 400
    
    note = Note.query.filter_by(note_id=note_id, user_id=current_user_id).first()
    if not note:
        return jsonify({'error': 'Note not found'}), 404
    
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
    except:
        db.session.rollback()
        return jsonify({'error': 'Failed to update note'}), 500

@note_bp.route('/notes/<note_id>', methods=['DELETE'])
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
    except:
        db.session.rollback()
        return jsonify({'error': 'Failed to delete note'}), 500
