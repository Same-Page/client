from collections import defaultdict

from flask import Blueprint, request, jsonify
from sqlalchemy.sql import func
from sqlalchemy import desc

from models.danmu import Danmu
from models.user import User
from models.vote import Vote
from models import db
from sp_token.tokens import create_token
from sp_token import get_user_from_token
from clients.youtube import get_comments


danmu_api = Blueprint("Danmu", __name__)


@danmu_api.route("/api/v1/latest_danmus", methods=["GET"])
@get_user_from_token(required=False)
def get_latest_danmus(user=None):
    # Only Youtube for now
    res = (
        db.session.query(Danmu, User)
        .join(User)
        .order_by(desc(Danmu.id))
        .group_by(User)
        .filter(Danmu.type == "Youtube")
        .limit(10)
        .all()
    )
    danmus = []
    for danmu, commenter in res:
        url = f"https://youtu.be/{danmu.video_id}?t={danmu.sec}"
        danmus.append(
            {
                "id": danmu.id,
                "url": url,
                "content": danmu.content,
                "created": danmu.created_time,
                "user": commenter.to_dict(),
                "self": True if (user and str(commenter.id) == str(user['numId'])) else False,
            }
        )

    return jsonify(danmus)


@danmu_api.route("/api/v1/video_danmu/<video_id>", methods=["POST"])
@get_user_from_token(required=True)
def post_video_danmu(video_id, user=None):
    payload = request.get_json()
    sec = payload['sec']
    video_type = payload['type']
    # TODO: sanitize input!
    content = payload['content']
    danmu = Danmu(video_id=video_id, type=video_type,
                  content=content, uuid=user['id'], sec=sec)
    db.session.add(danmu)
    db.session.commit()
    return 'success!'


@danmu_api.route("/api/v1/video_danmus/<video_id>", methods=["GET"])
@get_user_from_token(required=False)
def get_video_danmus(video_id, user=None):
    # Only Youtube for now
    # video_type = request.args.get("type")
    res = (
        db.session.query(Danmu, User)
        .join(User)
        .order_by(desc(Danmu.id))
        # .group_by(User) # same user can have multiple comments
        .filter(Danmu.video_id == video_id)
        .filter(Danmu.type == "Youtube")
        .limit(50)
        .all()
    )
    danmu_dict = defaultdict(list)
    for danmu, commenter in res:
        danmu_dict[danmu.sec].append(
            {
                "id": danmu.id,
                "content": danmu.content,
                "created": danmu.created_time,
                "sec": danmu.sec,
                "user": commenter.to_dict(),
                "self": True if (user and str(commenter.id) == str(user['numId'])) else False,
            }
        )
    get_comments(danmu_dict, video_id)
    return jsonify({"comments": danmu_dict, "login": user != None})
