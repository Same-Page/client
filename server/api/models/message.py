from sqlalchemy import Column, Integer, String, DateTime
import datetime

from models import db


class Message(db.Model):
    __tablename__ = "message"

    id = db.Column(db.Integer, primary_key=True)
    sender = db.Column(db.String(50))
    receiver = db.Column(db.String(50))
    message = db.Column(db.String(500))
    create_time = Column(DateTime, default=datetime.datetime.utcnow)

    def __repr__(self):
        return "<Message %r>" % self.id

    def to_dict(self):
        return {
            "id": self.id,
            "from": self.sender,
            "to": self.receiver,
            "content": self.message,
            "created": self.create_time,
        }
