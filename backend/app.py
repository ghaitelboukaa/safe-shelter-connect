import os
from flask import Flask
from dotenv import load_dotenv
from extensions import db, jwt, cors

from routes.auth import auth_bp
from routes.admin import admin_bp
from routes.zones import zones_bp
from routes.reservations import reservations_bp
from routes.victim import victim_bp
from routes.misc import misc_bp

load_dotenv()

app = Flask(__name__)
cors.init_app(app)

db_user = os.getenv('DB_USER')
db_password = os.getenv('DB_PASSWORD')
db_host = os.getenv('DB_HOST')
db_name = os.getenv('DB_NAME')

app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+pymysql://{db_user}:{db_password}@{db_host}/{db_name}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')

db.init_app(app)
jwt.init_app(app)

@app.route('/')
def home():
    return "Bienvenue dans le système de gestion des sinistres!"

app.register_blueprint(auth_bp, url_prefix='/api/v1/auth')
app.register_blueprint(admin_bp, url_prefix='/api/v1/admin')
app.register_blueprint(zones_bp, url_prefix='/api/v1/zones')
app.register_blueprint(reservations_bp, url_prefix='/api/v1/reservations')
app.register_blueprint(victim_bp, url_prefix='/api/v1/victim')
app.register_blueprint(misc_bp, url_prefix='/api/v1')

if __name__ == '__main__':
    app.run(debug=True)