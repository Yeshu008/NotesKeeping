from flask_jwt_extended.exceptions import NoAuthorizationError, RevokedTokenError, FreshTokenRequired, CSRFError 
from flask import jsonify

def register_jwt_error_handlers(app):
    @app.errorhandler(NoAuthorizationError)
    def handle_no_auth_error(e):
        return jsonify({'error': 'Authorization header missing'}), 401

    @app.errorhandler(RevokedTokenError)
    def handle_revoked_token(e):
        return jsonify({'error': 'Token has been revoked'}), 401

    @app.errorhandler(FreshTokenRequired)
    def handle_fresh_token_required(e):
        return jsonify({'error': 'Fresh token required'}), 401

    @app.errorhandler(CSRFError)
    def handle_csrf_error(e):
        return jsonify({'error': 'CSRF token missing or invalid'}), 401
