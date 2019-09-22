from sqlalchemy import Column, Integer, String, DateTime
import datetime
from models import db


class Auth(db.Model):
    __tablename__ = "auth"

    id = db.Column(db.Integer, primary_key=True)
    user_num_id = db.Column(db.Integer)
    password = db.Column(db.String(60))
    created = Column(DateTime, default=datetime.datetime.utcnow)

    def __repr__(self):
        return "<Auth %r>" % self.id
