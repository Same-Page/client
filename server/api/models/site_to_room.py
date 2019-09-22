import datetime

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from models import db


class SiteToRoom(db.Model):
    __tablename__ = "site_to_room"

    id = db.Column(db.Integer, primary_key=True)
    room_id = db.Column(db.Integer, ForeignKey("room.id"))
    hostname = db.Column(db.String(50))

    def __repr__(self):
        return "<SiteToRoom %r>" % self.id

    def to_dict(self):
        return {
            "id": self.id,
            "hostname": self.hostname,
            "room_id": self.room_id
        }
