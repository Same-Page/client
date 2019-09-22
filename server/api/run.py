from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

from models import db
from cfg.db import SQLALCHEMY_CONFIG
from api.auth import auth_api
from api.user import user_api
from api.follow import follow_api
from api.comment import comment_api
from api.message import message_api
from api.danmu import danmu_api
from api.upload import upload_api
from api.invitation import invitation_api
from api.room import room_api


def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_POOL_SIZE'] = 50
    app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024
    CORS(app)
    FLASK_CONFIG = {**SQLALCHEMY_CONFIG}
    app.config = {**app.config, **FLASK_CONFIG}
    db.init_app(app)
    app.register_blueprint(auth_api)
    app.register_blueprint(user_api)
    app.register_blueprint(follow_api)
    app.register_blueprint(comment_api)
    app.register_blueprint(message_api)
    app.register_blueprint(danmu_api)
    app.register_blueprint(upload_api)
    app.register_blueprint(invitation_api)
    app.register_blueprint(room_api)
    return app


application = create_app()


@application.route("/", methods=["GET"])
def health_check():
    return "OK"


if __name__ == "__main__":
    application.run(host='0.0.0.0', port=8080, debug=True)
