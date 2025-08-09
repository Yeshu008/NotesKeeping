from flask import Flask
from .config import Config
from .extensions import db, jwt, cors
from .routes.auth_routes import auth_bp
from .routes.note_routes import note_bp
from .services.token_blacklist import blacklisted_tokens

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(app, origins=['http://localhost:3000'])

    # Token blacklist check
    @jwt.token_in_blocklist_loader
    def check_if_token_revoked(jwt_header, jwt_payload):
        jti = jwt_payload['jti']
        return jti in blacklisted_tokens

    # Blueprints
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(note_bp, url_prefix="/api")

    # Health check
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return {"status": "healthy", "message": "API is running"}, 200

    with app.app_context():
        db.create_all()

    return app
