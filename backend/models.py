from datetime import datetime

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# 1. ZoneRegroupement (Mafihach Foreign Keys)
class ZoneRegroupement(db.Model):
    __tablename__ = 'zoneregroupement'
    id_zone = db.Column(db.Integer, primary_key=True)
    nom_zone = db.Column(db.String(100), nullable=False)
    adress_gps = db.Column(db.String(255))
    capacite_max = db.Column(db.Integer, nullable=False)
    capacite_restante = db.Column(db.Integer, nullable=False)

# 2. PointAffectation (Kait-creera qbel Sinistre)
class PointAffectation(db.Model):
    __tablename__ = 'pointaffectation'
    id_point = db.Column(db.Integer, primary_key=True)
    num_emplacement = db.Column(db.String(50))
    statut = db.Column(db.Enum('Libre', 'Occup'), default='Libre')
    id_zone = db.Column(db.Integer, db.ForeignKey('zoneregroupement.id_zone'))

# 3. User (Mafihach Foreign Keys par defaut, sauf l-Admin li m-connecte m3a Zone)
class User(db.Model):
    __tablename__ = 'user'
    id_user = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default='sinistre')  # 'super_admin', 'admin', aw 'sinistre'
    id_zone = db.Column(db.Integer, db.ForeignKey('zoneregroupement.id_zone'), nullable=True)

# 4. Sinistre (Hwa l-lakhr hit fih Foreign Keys l-User o l-PointAffectation)
class Sinistre(db.Model):
    __tablename__ = 'sinistre'
    id_sinistre = db.Column(db.Integer, primary_key=True)
    nom = db.Column(db.String(100))
    prenom = db.Column(db.String(100))
    cin = db.Column(db.String(20), unique=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id_user'))
    # Jdid: bach n-3rfo l-etat dyal reservation
    statut_reservation = db.Column(db.Enum('Pending', 'Confirmed', 'Rejected'), default=None)
    id_point = db.Column(db.Integer, db.ForeignKey('pointaffectation.id_point'))


# 5. Ressource (Types dyal l-mou3idat)
class Ressource(db.Model):
    __tablename__ = 'ressource'
    id_ressource = db.Column(db.Integer, primary_key=True)
    type_ressource = db.Column(db.String(100))
    unite_mesure = db.Column(db.String(50))

# 6. Stocker (L-quantité f kol zone)
class Stocker(db.Model):
    __tablename__ = 'stocker'
    id_zone = db.Column(db.Integer, db.ForeignKey('zoneregroupement.id_zone'), primary_key=True)
    id_ressource = db.Column(db.Integer, db.ForeignKey('ressource.id_ressource'), primary_key=True)
    quantite_disponible = db.Column(db.Float, default=0.0)

# 7. Distribuer (Journal d'admin)
class Distribuer(db.Model):
    __tablename__ = 'distribuer'
    id_distribution = db.Column(db.Integer, primary_key=True)
    id_zone = db.Column(db.Integer, db.ForeignKey('zoneregroupement.id_zone'))
    id_sinistre = db.Column(db.Integer, db.ForeignKey('sinistre.id_sinistre'))
    id_ressource = db.Column(db.Integer, db.ForeignKey('ressource.id_ressource'))
    quantite_donnee = db.Column(db.Float)
    unite_mesure = db.Column(db.String(50))
    date_distribution = db.Column(db.DateTime, default=datetime.utcnow)

class Equipe(db.Model):
    __tablename__ = 'equipe'
    id_equipe = db.Column(db.Integer, primary_key=True)
    role = db.Column(db.String(100))
    contact = db.Column(db.String(20))
    id_zone = db.Column(db.Integer, db.ForeignKey('zoneregroupement.id_zone'))
    