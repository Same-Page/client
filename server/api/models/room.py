import datetime

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from models import db


class Room(db.Model):
    __tablename__ = "room"

    id = db.Column(db.Integer, primary_key=True)
    owner = db.Column(db.Integer, ForeignKey("user.id"))
    name = db.Column(db.String(50))
    about = db.Column(db.String(1000))
    create_time = Column(DateTime, default=datetime.datetime.utcnow)
    active = db.Column(db.Boolean, default=True)

    def __repr__(self):
        return "<Room %r>" % self.id

    def to_dict(self):
        return {
            "id": self.id,
            "owner": self.owner,
            "name": self.name,
            "about": self.about,
            "active": self.active
        }
