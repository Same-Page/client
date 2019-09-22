import uuid

from flask import Blueprint, request, jsonify
import bcrypt

from models.user import User
from models.auth import Auth
from models import db
from sp_token.tokens import create_token, revoke_token
from sp_token import get_user_from_token
from api.follow import get_follower_count, get_following_count
from api.name import get_rand_name
# from cfg.urls import s3

auth_api = Blueprint("Auth", __name__)


class Account:
    def __init__(self, token, user):
        self.token = token
        self.user = user

    def to_dict(self):
        """  
        {  
        token: "dsfaoijclkjvzcxzviojsifj"
        id: dsfa-dfad-sfasdfad-fdasfa
        numId: 123
        name: "real admin"
        about: "大家好！"
        credit: 78
        followerCount: 123
        followingCount: 321
        }
        """
        account_data = self.user
        # No needed to use s3 url since we are using version now,
        # updating avatar will get a new version number,
        # requesting foo.jpg?v=2 will force cloudfront to fetch
        # latest from s3
        account_data["token"] = self.token
        account_data["followerCount"] = get_follower_count(self.user['id'])
        account_data["followingCount"] = get_following_count(self.user['id'])
        return account_data


@auth_api.route("/api/v1/login", methods=["POST"])
def login():
    payload = request.get_json()
    user_id = payload["userId"]
    password = payload["password"]
    auth = Auth.query.filter_by(user_num_id=user_id).first()
    if not auth:
        return jsonify({"error": "账号不存在"}), 400

    if bcrypt.checkpw(password.encode("utf8"), auth.password.encode("utf8")):
        user = User.query.filter_by(id=user_id).first()
        # Check if banned
        if user.is_banned():
            return jsonify({"error": "封禁中"}), 403
        token = create_token(user)
        account_data = Account(token, user.to_dict()).to_dict()
        return jsonify(account_data)
    else:
        return jsonify({"error": "密码错误"}), 401


@auth_api.route("/api/v1/account", methods=["GET"])
@get_user_from_token(required=True)
def get_account_data(user=None):
    token = request.headers.get("token")
    account_data = Account(token, user).to_dict()
    return jsonify(account_data)


@auth_api.route("/api/v1/reset_password", methods=["POST"])
@get_user_from_token(required=True)
def reset_password(user=None):
    payload = request.get_json()
    new_password = payload["password"]
    new_hash = bcrypt.hashpw(new_password.encode("utf8"), bcrypt.gensalt(10))
    Auth.query.filter_by(user_num_id=user['numId']).update(
        {"password": new_hash})
    db.session.commit()
    return "success"


@auth_api.route("/api/v1/register", methods=["POST"])
def register():
    payload = request.get_json()
    password = payload["password"]
    password_hash = bcrypt.hashpw(password.encode("utf8"), bcrypt.gensalt(10))
    user_uuid = uuid.uuid4().hex
    user = User(uuid=user_uuid, name=get_rand_name())
    db.session.add(user)
    db.session.commit()
    user.uuid = str(user.id)
    auth = Auth(user_num_id=user.id, password=password_hash)
    db.session.add(auth)
    db.session.commit()

    token = create_token(user)
    account_data = Account(token, user.to_dict()).to_dict()
    return jsonify(account_data)


@auth_api.route("/api/v1/logout", methods=["POST"])
@get_user_from_token(required=True)
def logout(user=None):
    revoke_token(request.headers.get("token"))
    return "success"
