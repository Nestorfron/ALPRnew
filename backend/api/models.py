from flask_sqlalchemy import SQLAlchemy  # type: ignore
from config import Config

db = SQLAlchemy(engine_options=Config.SQLALCHEMY_ENGINE_OPTIONS)

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(128), index=True, unique=True)
    password = db.Column(db.String(512))
    email = db.Column(db.String(120), unique=True)
    role = db.Column(db.String(64))
    active = db.Column(db.Boolean(), default=True)
    
    def __repr__(self):
        return f"<User {self.username}>"
    
    def serialize(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "role": self.role,
            "active": self.active
        }


class Vehicle(db.Model):
    __tablename__ = 'vehicles'

    id = db.Column(db.Integer, primary_key=True)
    plate = db.Column(db.String(64), index=True, unique=True)
    status = db.Column(db.String(64))
    description = db.Column(db.String(256))
    updated_at = db.Column(db.DateTime, default=db.func.now())
    
    def __repr__(self):
        return f"<Vehicle {self.plate}>"
    
    def serialize(self):
        return {
            "id": self.id,
            "plate": self.plate,
            "status": self.status,
            "description": self.description,
            "updated_at": self.updated_at
        }
