from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from app.config import Config
from .errors.jwt_error_handler import register_jwt_error_handlers
from .errors.error import register_error_handlers
from app.utils.logger import setup_logging
from .models import db
from flask_migrate import Migrate

blacklisted_tokens = set()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    setup_logging(app)
   
    db.init_app(app)
    migrate = Migrate(app, db)
    jwt = JWTManager(app)
    CORS(app, origins=['http://localhost:3000'])

   
    from .routes.auth_routes import auth_bp
    from .routes.notes_routes import notes_bp
    from .routes.health_routes import health_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(notes_bp, url_prefix='/api/notes')
    app.register_blueprint(health_bp, url_prefix='/api')

   
    @jwt.token_in_blocklist_loader
    def check_if_token_revoked(jwt_header, jwt_payload):
        jti = jwt_payload['jti']
        return jti in blacklisted_tokens

   
    app.blacklisted_tokens = blacklisted_tokens

    
    register_jwt_error_handlers(app)
    register_error_handlers(app)

    
    with app.app_context():
        db.create_all()

    return app
