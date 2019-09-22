from flask import Blueprint, request, jsonify
from sqlalchemy import func

from models import db
from models.user import User
from models.follow import Follow
from sp_token import get_user_from_token


invitation_api = Blueprint("Invitation", __name__)

ALL_COST = 20


@invitation_api.route("/api/v1/invite", methods=["POST"])
@get_user_from_token(required=True)
def invite(user=None):
    payload = request.get_json()
    invitation_type = payload['invitationType']
    if invitation_type == 'room':
        return 'OK'

    followers = []
    user = User.query.filter_by(id=user['numId']).first()
    if invitation_type == 'follower':
        followers = (
            db.session.query(User)
            .join(Follow, Follow.follower_id == User.uuid)
            .filter(Follow.user_id == user.uuid, Follow.active == True)
            .limit(1000)
            # TODO: order by last active time
        )
        followers = [u.to_dict() for u in followers]
    elif invitation_type == "all":
        if user.credit >= ALL_COST:
            user.credit = user.credit - ALL_COST
            db.session.commit()
        else:
            return 'low credit', 402

    return jsonify({
        "followers": followers
    })
