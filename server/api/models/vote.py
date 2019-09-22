from sqlalchemy import Column, Integer, String, SMALLINT
import datetime
from models import db


class Vote(db.Model):
    __tablename__ = "vote"

    id = db.Column(db.Integer, primary_key=True)
    comment_id = db.Column(db.Integer)
    score = db.Column(db.Integer)
    user_id = db.Column(db.String(60))

    def __repr__(self):
        return "<Vote %r>" % self.id
