from flask import Flask 
from flask_cors import CORS 
from flask_jwt_extended import JWTManager 
from flask_admin import Admin 
from flask_admin.contrib.sqla import ModelView 
from flask_migrate import Migrate 
from extensions import mail 

from config import Config
from api.models import db, User, Vehicle
# Importa tus Blueprints
from api.routes import api

# Crear la app
app = Flask(__name__)
app.config.from_object(Config)
mail.init_app(app)

# Extensiones
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

db.init_app(app)
jwt = JWTManager(app)
migrate = Migrate(app, db)

# Flask-Admin
admin = Admin(app, name='Panel Admin')
admin.add_view(ModelView(User, db.session))
admin.add_view(ModelView(Vehicle, db.session))

app.register_blueprint(api, url_prefix='/api')


# Rutas básicas para test
@app.route('/ping')
def ping():
    return {'status': 'ok'}, 200

# Crear tablas si no existen (desarrollo)
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True)
