from flask import Blueprint, request, jsonify, abort
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Note, db
from app.schemas.note_schema import NoteCreateSchema, NoteUpdateSchema
from app.utils.validators import validate_json

notes_bp = Blueprint('notes', __name__)

@notes_bp.route('', methods=['GET'])
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


@notes_bp.route('', methods=['POST'])
@jwt_required()
def create_note():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    validated_data, errors = validate_json(NoteCreateSchema, data)
    if errors:
        abort(400, description={'validation_errors': errors})

    new_note = Note(
        note_title=validated_data.note_title,
        note_content=validated_data.note_content,
        user_id=current_user_id
    )

    try:
        db.session.add(new_note)
        db.session.commit()
    except Exception:
        db.session.rollback()
        abort(500, description='Failed to create note')

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


@notes_bp.route('/<note_id>', methods=['GET'])
@jwt_required()
def get_note(note_id):
    current_user_id = get_jwt_identity()
    note = Note.query.filter_by(note_id=note_id, user_id=current_user_id).first()
    if not note:
        abort(404, description='Note not found')

    return jsonify({
        'note': {
            'note_id': note.note_id,
            'note_title': note.note_title,
            'note_content': note.note_content,
            'last_update': note.last_update.isoformat(),
            'created_on': note.created_on.isoformat()
        }
    }), 200


@notes_bp.route('/<note_id>', methods=['PUT'])
@jwt_required()
def update_note(note_id):
    current_user_id = get_jwt_identity()
    data = request.get_json()
    validated_data, errors = validate_json(NoteUpdateSchema, data)
    if errors:
        abort(400, description={'validation_errors': errors})

    note = Note.query.filter_by(note_id=note_id, user_id=current_user_id).first()
    if not note:
        abort(404, description='Note not found')

    if validated_data.note_title is not None:
        note.note_title = validated_data.note_title
    if validated_data.note_content is not None:
        note.note_content = validated_data.note_content

    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        abort(500, description='Failed to update note')

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


@notes_bp.route('/<note_id>', methods=['DELETE'])
@jwt_required()
def delete_note(note_id):
    current_user_id = get_jwt_identity()
    note = Note.query.filter_by(note_id=note_id, user_id=current_user_id).first()
    if not note:
        abort(404, description='Note not found')

    try:
        db.session.delete(note)
        db.session.commit()
    except Exception:
        db.session.rollback()
        abort(500, description='Failed to delete note')

    return jsonify({'message': 'Note deleted successfully'}), 200
