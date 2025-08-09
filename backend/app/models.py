from .extensions import db
from datetime import datetime
import uuid

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
