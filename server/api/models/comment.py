from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
import datetime
from models import db


class Comment(db.Model):
    __tablename__ = "comment"

    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.String(500))
    created_time = Column(DateTime, default=datetime.datetime.utcnow)
    user_id = Column(db.String(50), ForeignKey("user.uuid"))
    url = db.Column(db.String(50))

    def __repr__(self):
        return "<Comment %r>" % self.id

    def to_dict(self):
        return {
            "id": self.id,
            "userId": self.user_id,
            "created": self.created_time,
            "content": self.content,
        }
