import datetime

from sqlalchemy import Column, Integer, String, DateTime
from models import db
from cfg.urls import cloud_front


class User(db.Model):
    __tablename__ = "user"

    id = db.Column(db.Integer)
    credit = db.Column(db.Integer, default=10)
    uuid = db.Column(db.String(50), primary_key=True)
    name = db.Column(db.String(50), default="no name")
    about = db.Column(db.String(500))
    has_avatar = db.Column(db.Integer, default=0)
    role = db.Column(db.Integer, default=0)
    block_until = Column(DateTime)
    create_time = Column(DateTime, default=datetime.datetime.utcnow)
    last_checkin = Column(DateTime, default=datetime.datetime.utcnow)
    room = db.Column(db.String(50), default="5")
    mode = db.Column(db.String(20), default="site")

    def __repr__(self):
        return "<User %r>" % self.id

    def is_mod(self):
        return self.role >= 300

    def is_banned(self):
        return self.block_until and datetime.datetime.now() < self.block_until

    def to_dict(self):
        if self.has_avatar:
            avatar_src = f"{cloud_front}{self.uuid}.jpg?v={self.has_avatar}"
        else:
            avatar_id = self.id % 150
            avatar_src = f"{cloud_front}avatar/{avatar_id}.jpg"

        return {
            # From now on, uuid will be same as number id
            # only return uuid to frontend
            # frontend doesn't need to care about uuid vs number id
            # there is just one id
            "numId": self.id,
            "id": self.uuid,
            "name": self.name,
            "credit": self.credit,
            "about": self.about,
            "role": self.role,
            "isMod": self.is_mod(),
            "isBanned": self.is_banned(),
            "avatarSrc": avatar_src,
            "mode": self.mode,
            "room": self.room
        }
