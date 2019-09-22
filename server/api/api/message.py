from flask import Blueprint, request, jsonify
import emoji

from models.user import User
from models.message import Message
from models import db
from sp_token.tokens import create_token, revoke_token
from sp_token import get_user_from_token
from api.follow import get_follower_count, get_following_count

message_api = Blueprint("Message", __name__)


def is_pure_emoji(content):
    # string only contains emoji
    return ''.join(c for c in content if c in emoji.UNICODE_EMOJI) == content


def is_image(content):
    return any(file_extension in content for file_extension in ['.jpg', '.jpeg', '.gif', '.png', '.webp'])


@message_api.route("/api/v1/message", methods=["POST"])
@get_user_from_token(True)
def post_message(user=None):
    """
    Insert new message and also get latest messages since offset,
    not just the message inserted
    """
    payload = request.get_json()
    receiver = payload["userId"]
    content = payload["content"]
    offset = payload.get("offset", 0)
    db.session.add(
        Message(sender=user['id'], receiver=receiver, message=content))
    db.session.commit()
    return _get_messages(user, offset)


def _get_messages(user, offset=0):
    """
    Return a dictionary of conversations
    {
        uuid: {
            user: {},
            messages: []
        },
    }
    """
    messages = (
        Message.query.filter(
            (Message.sender == user['id']) | (Message.receiver == user['id'])
        )
        .filter(Message.id > offset)
        .order_by(Message.id.asc())
        .all()
    )

    conversations = {}

    for msg in messages:
        other_id = msg.receiver if msg.sender == user['id'] else msg.sender
        if msg.sender == user['id']:
            other_id = msg.receiver
            self_sent = True
        else:
            other_id = msg.sender
            self_sent = False
        msg_dict = msg.to_dict()
        msg_dict["self"] = self_sent
        msg_dict["type"] = "text"

        if msg.message.startswith("stickers/"):
            msg_dict["type"] = "sticker"

        elif is_pure_emoji(msg.message):
            msg_dict["type"] = "emoji"

        elif is_image(msg.message):
            msg_dict["type"] = "image"

        if other_id in conversations:
            conversation = conversations[other_id]
            conversation["messages"].append(msg_dict)
        else:
            conversations[other_id] = {"messages": [msg_dict]}
    others = User.query.filter(User.uuid.in_(conversations.keys())).all()
    for other in others:
        conversations[other.uuid]["user"] = other.to_dict()

    return jsonify(conversations)


@message_api.route("/api/v1/messages", methods=["GET"])
@get_user_from_token(True)
def get_messages(user=None):
    offset = request.args.get("offset", 0)
    return _get_messages(user, offset)
