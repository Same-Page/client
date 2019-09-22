from datetime import datetime, date, timedelta

from flask import Blueprint, request, jsonify
from sqlalchemy import func
from sqlalchemy import desc

from models import db
from models.user import User
from models.follow import Follow
from api.follow import get_follower_count
from api.auth import Account
from sp_token import get_user_from_token
from sp_token.tokens import revoke_all_tokens_of_user, refresh_user_data

from clients.s3 import upload_file

user_api = Blueprint("User", __name__)

THANK_WAIT_TIME = 60*60
THANK_WAIT_TIME_MOD = 60*5

# below two endpoint for user themself
@user_api.route("/api/v1/user", methods=["GET"])
@get_user_from_token(True)
def user_from_token(user=None):
    '''
    Used by socket server to check user's token
    and get basic user data
    If we move token management to separate service,
    e.g. elasticcache, we won't need this endpoint maybe
    '''
    return jsonify(user)


@user_api.route("/api/v1/user", methods=["POST"])
@get_user_from_token(True)
def update_user(user=None):
    name = request.form.get("name")
    about = request.form.get("about")
    avatar = request.files.get("avatar")

    u = User.query.filter_by(uuid=user['id']).first()

    if avatar:
        u.has_avatar = u.has_avatar + 1
        upload_file(avatar, f"{u.uuid}.jpg")

    u.name = name
    u.about = about

    # User.query.filter_by(id=user.id).update(
    #     {"name": user.name, "about": user.about, "has_avatar": user.has_avatar}
    # )

    db.session.commit()
    token = request.headers.get("token")
    account_data = Account(token, u.to_dict()).to_dict()
    refresh_user_data(token, u)
    return jsonify(account_data)


@user_api.route("/api/v1/change_room", methods=["POST"])
@get_user_from_token(True)
def change_room(user=None):
    payload = request.get_json()
    mode = payload.get('mode')
    room = payload.get('room')

    u = User.query.filter_by(uuid=user['id']).first()
    if mode:
        u.mode = mode
    if room:
        u.room = room
    db.session.commit()

    token = request.headers.get("token")
    refresh_user_data(token, u)

    return 'ok'

# Endpoints below for getting other user rather than self


@user_api.route("/api/v1/user/<int:user_id>", methods=["GET"])
@get_user_from_token(True)
def get_user_from_id(user_id, user=None):
    # print(f"user id {user_id}")
    return _get_user(user, id=user_id)


def _get_user(login_user, **kwarg):
    # should not be used to get self data
    # use account login to get self data
    user = User.query.filter_by(**kwarg).first()
    follower_num = get_follower_count(user.uuid)
    res = user.to_dict()
    res["followerCount"] = follower_num
    res["following"] = False
    if user:
        if (
            Follow.query.filter_by(user_id=user.uuid)
            .filter_by(follower_id=login_user['id'])
            .filter_by(active=True)
            .first()
        ):
            res["following"] = True
    return jsonify(res)


# To be deleted when client's uuid same as id
@user_api.route("/api/v1/user/<uuid>", methods=["GET"])
@get_user_from_token(True)
def get_user_from_uuid(uuid, user=None):
    # old client is sending uuid instead of id to socket server
    # TODO: update socket server to send id from login lookup
    # no such need, uuid's value will be the same as id in the future
    # print(f"uuid {uuid}")
    return _get_user(user, uuid=uuid)


@user_api.route("/api/v1/latest_users", methods=["GET"])
@get_user_from_token(False)
def get_latest_users(user=None):
    users = User.query.order_by(
        desc(User.id)).limit(10)
    return jsonify([u.to_dict() for u in users])


@user_api.route("/api/v1/thank_user", methods=["POST"])
@get_user_from_token(True)
def thank_user(user=None):

    payload = request.get_json()
    user_id = payload["userId"]
    if str(user_id) == str(user['numId']):
        return "not for yourself", 400
    # Check time, set time

    # user id in payload is uuid
    # user.id is just id since it's from db model
    user = User.query.filter_by(uuid=user['id']).first()
    time_elapse = datetime.now() - user.last_checkin

    thank_wait_time = THANK_WAIT_TIME
    if user.is_mod():
        thank_wait_time = THANK_WAIT_TIME_MOD

    if time_elapse.seconds < thank_wait_time:
        return "Too soon", 429

    target_user = User.query.filter_by(uuid=user_id).first()
    target_user.credit = target_user.credit + 3
    user.credit = user.credit + 1
    user.last_checkin = datetime.now()
    db.session.commit()
    # TODO: refresh user and target user data in cache

    return jsonify({'credit': user.credit})


# Below endpoints are used by mod and admin
@user_api.route("/api/v1/block_user", methods=["POST"])
@get_user_from_token(True)
def block_user(user=None):
    if not user['isMod']:
        return jsonify("No permission"), 403
    payload = request.get_json()
    user_id = payload["userId"]
    block_until = date.today() + timedelta(3)
    target_user = User.query.filter_by(uuid=user_id).first()
    if target_user.role >= user['role']:
        return jsonify("Target user has higher permission"), 409

    target_user.block_until = block_until
    db.session.commit()
    # Delete token
    revoke_all_tokens_of_user(user_id)
    return jsonify(f"Block until {block_until}")


@user_api.route("/api/v1/unblock_user", methods=["POST"])
@get_user_from_token(True)
def unblock_user(user=None):
    if not user['isMod']:
        return jsonify("No permission"), 403

    payload = request.get_json()
    user_id = payload["userId"]
    target_user = User.query.filter_by(uuid=user_id).first()
    if target_user.role >= user['role']:
        return jsonify("Target user has higher permission"), 409

    target_user.block_until = None
    db.session.commit()
    return jsonify(f"unblocked")
