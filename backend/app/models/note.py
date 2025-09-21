import uuid
from datetime import datetime
from . import db

class Note(db.Model):
    __tablename__ = 'notes'

    note_id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    note_title = db.Column(db.String(200), nullable=False)
    note_content = db.Column(db.Text, nullable=True)
    last_update = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_on = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.String(36), db.ForeignKey('users.user_id'), nullable=False)
