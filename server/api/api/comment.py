from flask import Blueprint, request, jsonify
from sqlalchemy.sql import func
from sqlalchemy import desc, text

from models.comment import Comment
from models.user import User
from models.vote import Vote
from models import db
from sp_token.tokens import create_token
from cfg.urls import cloud_front
from sp_token import get_user_from_token


comment_api = Blueprint("Comment", __name__)


@comment_api.route("/api/v1/post_comment", methods=["POST"])
@get_user_from_token(required=True)
def post_comment(user=None):

    payload = request.get_json()
    # TODO: sanitize input
    url = payload["url"]
    content = payload["content"]
    reply_to_user_id = payload.get("replay_to_user_id")
    reply_to_user_name = payload.get("replay_to_user_name")

    if reply_to_user_id:
        content = "@" + reply_to_user_name + "\n" + content
        # TODO: send notification

    # Because when getting comments, we join on user.uuid, so we also need to
    # save with user.uuid here
    db.session.add(Comment(url=url, content=content, user_id=user['id']))
    db.session.commit()
    return "success"


@comment_api.route("/api/v1/vote_comment", methods=["POST"])
@get_user_from_token(required=True)
def vote_comment(user=None):

    payload = request.get_json()
    comment_id = payload["comment_id"]

    existing_vote = Vote.query.filter(
        Vote.comment_id == comment_id, Vote.user_id == user['id']
    ).first()
    if existing_vote:
        existing_vote.score = 1 if existing_vote.score == 0 else 0
    else:
        db.session.add(Vote(comment_id=comment_id,
                            user_id=user['id'], score=1))
    db.session.commit()
    return "success"


@comment_api.route("/api/v1/latest_comments", methods=["GET"])
@get_user_from_token(required=False)
def get_latest_comments(user=None):
    res = (
        db.session.query(Comment, User)
        .join(User)
        .order_by(desc(Comment.id))
        .group_by(User)
        # .filter(User.has_avatar)
        .limit(10)
        .all()
    )
    comments = []
    for comment, commenter in res:
        comments.append({
            "id": comment.id,
            "url": comment.url,
            "content": comment.content,
            "created": comment.created_time,
            "user": commenter.to_dict(),
            "self": True if (user and str(commenter.id) == str(user['id'])) else False,
        })

    return jsonify(comments)


@comment_api.route("/api/v1/get_comments", methods=["POST"])
@get_user_from_token(required=False)
def get_comments(user=None):
    payload = request.get_json()
    url = payload["url"]
    limit = payload["limit"]
    order = payload["order"]
    offset = payload["offset"]

    orderBy = "score Desc, "
    if order == "newest":
        orderBy = ""

    query_str = f"SELECT comment.id, comment.content, comment.user_id, comment.created_time,\
        user.id, user.name, user.has_avatar, SUM(vote.score) as score FROM comment \
        LEFT JOIN vote on vote.comment_id = comment.id \
        LEFT JOIN user on comment.user_id = user.uuid \
        WHERE comment.url = '{url}' GROUP BY comment.id ORDER BY {orderBy} created_time DESC LIMIT {offset}, {limit}"

    res = db.engine.execute(text(query_str))

    # Get user's votes for this url
    user_voted_comments = []
    if user:
        user_votes = Vote.query.filter(
            Vote.user_id == user['id'], Vote.score == 1)
        user_voted_comments = [vote.comment_id for vote in user_votes]

    # comment.user_id is uuid (zxcvjohsudaf) in the past
    # therefore we also get user.id and return to client
    # In the future, uuid will be the same as user.id
    # avatar image is always {uuid}.jpg
    comments = []
    for row in res:
        id, content, uuid, created, user_id, name, has_avatar, score = row

        if has_avatar:
            avatar_src = f"{cloud_front}{uuid}.jpg?v={has_avatar}"
        else:
            avatar_id = user_id % 150
            avatar_src = f"{cloud_front}avatar/{avatar_id}.jpg"

        comments.append(
            {
                "id": id,
                "content": content,
                "created": created,
                "userId": user_id,
                "name": name,
                "avatarSrc": avatar_src,
                "score": int(score) if score else None,
                "self": True if (user and str(user['numId']) == str(user_id)) else False,
                "voted": id in user_voted_comments,
            }
        )

    return jsonify(comments)
