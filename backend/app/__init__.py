from flask import Flask
from .config import Config
from .extensions import db, cors

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    cors.init_app(app, origins=["http://localhost:3000"])

    from .routes.health import health_bp
    app.register_blueprint(health_bp)

    with app.app_context():
        db.create_all()

    return app
