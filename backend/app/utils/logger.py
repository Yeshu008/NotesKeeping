import logging
import os
from flask import request

os.makedirs("logs", exist_ok=True)

logger = logging.getLogger("inspektlabs")
logger.setLevel(logging.INFO)

handler = logging.FileHandler("logs/app.log")
handler.setLevel(logging.INFO)
formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)

def setup_logging(app):
    @app.before_request
    def log_request_info():
        logger.info(f"{request.method} {request.path}")
