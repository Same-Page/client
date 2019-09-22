from flask import Blueprint, request, jsonify
from sqlalchemy.sql import func
from sqlalchemy import desc, text

from models.room import Room
from models.site_to_room import SiteToRoom
from models.user import User
from models import db
from sp_token import get_user_from_token
from sp_token.tokens import refresh_user_data

room_api = Blueprint("Room", __name__)

CREATE_ROOM_COST = 60


@room_api.route("/api/v1/rooms", methods=["GET"])
@get_user_from_token(required=False)
def get_rooms(user=None):
    res = db.session.query(Room, User).join(
        User).filter(Room.active == True).all()
    rooms = []
    for room, user in res:
        room_data = room.to_dict()
        room_data['owner'] = user.to_dict()
        rooms.append(room_data)
    return jsonify(rooms)


@room_api.route("/api/v1/site_to_rooms", methods=["GET"])
@get_user_from_token(required=False)
def get_site_to_rooms(user=None):
    # Only for lobby for now
    # SiteToRoom
    # res = SiteToRoom.query(...).join(Room).join(User).group_by(Room.id).all()

    res = db.session.query(SiteToRoom, Room, User).join(Room, SiteToRoom.room_id == Room.id).join(
        User, Room.owner == User.id).filter(Room.active == True).all()
    sites_to_rooms = {}

    for site_to_room, room, owner in res:
        room_data = room.to_dict()
        room_data['owner'] = owner.to_dict()
        sites_to_rooms[site_to_room.hostname] = room_data

    # Can grow to be a big payload quickly
    return jsonify(sites_to_rooms)


@room_api.route("/api/v1/create_room", methods=["POST"])
@get_user_from_token(required=True)
def create_room(user=None):

    u = User.query.filter_by(id=user['numId']).first()
    if u.credit < CREATE_ROOM_COST:
        return 'low credit', 402

    u.credit = u.credit - CREATE_ROOM_COST

    name = request.form.get("name")
    about = request.form.get("about")
    room = Room(name=name, about=about, owner=u.id)
    db.session.add(room)
    db.session.commit()

    token = request.headers.get("token")
    refresh_user_data(token, u)
    return "success"
