from flask import Blueprint, request, jsonify
from sqlalchemy import func

from models import db
from models.user import User
from models.follow import Follow
from sp_token import get_user_from_token


follow_api = Blueprint("Follow", __name__)


@follow_api.route("/api/v1/followers", methods=["GET"])
@get_user_from_token(required=True)
def get_followers(user=None):
    """
    Get followers of user, require auth
    """
    offset = request.args.get("offset", 0)
    followers = (
        db.session.query(User)
        .join(Follow, Follow.follower_id == User.uuid)
        .filter(Follow.user_id == user['id'], Follow.active == True)
        .offset(offset)
        .limit(20)
    )
    followers = [user.to_dict() for user in followers]
    return jsonify(followers)


@follow_api.route("/api/v1/followings", methods=["GET"])
@get_user_from_token(required=True)
def get_followings(user=None):
    """
    Get followings of user, require auth
    """
    offset = request.args.get("offset", 0)
    followers = (
        db.session.query(User)
        .join(Follow, Follow.user_id == User.uuid)
        .filter(Follow.follower_id == user['id'], Follow.active == True)
        .offset(offset)
        .limit(20)
    )
    followers = [user.to_dict() for user in followers]
    return jsonify(followers)


@follow_api.route("/api/v1/follow", methods=["POST"])
@get_user_from_token(required=True)
def follow_user(user=None):
    """
    Follow or unfollow
    """
    payload = request.get_json()
    uuid = payload["id"]
    existing_follow = Follow.query.filter(
        Follow.follower_id == user['id'], Follow.user_id == uuid
    ).first()
    if existing_follow:
        existing_follow.active = False if existing_follow.active else True
    else:
        db.session.add(
            Follow(follower_id=user['id'], user_id=uuid, active=True))
    db.session.commit()
    return "success"


def get_follower_count(uuid):
    follower_num = Follow.query.filter(
        Follow.user_id == uuid, Follow.active == True
    ).count()
    return follower_num


def get_following_count(uuid):
    following_num = Follow.query.filter(
        Follow.follower_id == uuid, Follow.active == True
    ).count()
    return following_num
