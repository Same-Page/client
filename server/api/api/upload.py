import time

from flask import Blueprint, request, jsonify

from api.auth import Account
from sp_token import get_user_from_token
from clients.s3 import upload_file
from cfg.urls import cloud_front

upload_api = Blueprint("Upload", __name__)


@upload_api.route("/api/v1/chat_upload", methods=["POST"])
@get_user_from_token(True)
def update_user(user=None):
    """
    Used by both chat and direct message
    """

    user_file = request.files.get("file")
    file_name = f"00000_chat_upload/{user['numId']}-{user_file.filename}"
    upload_file(user_file, file_name)
    cloud_front_url = f"{cloud_front}{file_name}"

    return jsonify({'url': cloud_front_url})

# Endpoints below for getting other user rather than self
