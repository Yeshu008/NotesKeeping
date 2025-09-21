from flask import jsonify
import traceback
from app.utils.logger import logger

def register_error_handlers(app):
    @app.errorhandler(400)
    def bad_request(e):
        return jsonify({'error': 'Bad Request', 'message': str(e)}), 400

    @app.errorhandler(401)
    def unauthorized(e):
        return jsonify({'error': 'Unauthorized', 'message': str(e)}), 401

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({'error': 'Not Found', 'message': str(e)}), 404

    @app.errorhandler(409)
    def conflict(e):
        return jsonify({'error': 'Conflict', 'message': str(e)}), 409

    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({'error': 'Internal Server Error', 'message': str(e)}), 500
    
    @app.errorhandler(Exception)
    def handle_exception(e):
        logger.exception("Unhandled Exception: %s", traceback.format_exc())
        return jsonify({"error": str(e)}), 500
