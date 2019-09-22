from sqlalchemy import Column, Integer, String, DateTime
import datetime
from models import db


class Follow(db.Model):
    __tablename__ = "follow"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(50))
    follower_id = db.Column(db.String(50))
    active = db.Column(db.Boolean)
    create_time = Column(DateTime, default=datetime.datetime.utcnow)
    update_time = Column(DateTime, default=datetime.datetime.utcnow)

    def __repr__(self):
        return "<Follow %r>" % self.id

    def to_dict(self):
        return {
            "id": self.id,
            "userId": self.user_id,
            "followerId": self.follower_id,
            "active": self.active,
            "created": self.create_time,
            "updated": self.update_time,
        }
