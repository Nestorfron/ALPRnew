from flask_sqlalchemy import SQLAlchemy  # type: ignore
from config import Config

db = SQLAlchemy(engine_options=Config.SQLALCHEMY_ENGINE_OPTIONS)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), index=True, unique=True)
    password = db.Column(db.String(128))
    email = db.Column(db.String(120), unique=True)
    active = db.Column(db.Boolean(), default=True)
    
    def __repr__(self):
        return f"<User {self.username}>"
    
    def serialize(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "active": self.active
        }