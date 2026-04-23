# ⛺ Safe-Shelter Connect | Plateforme de Logistique Post-Séisme | 
## 📌 Description du Projet
**Safe-Shelter Connect** est un système d'information complet conçu pour gérer les opérations d'urgence après un séisme. Le système permet de gérer les zones de regroupement, d'affecter des abris aux sinistrés, et d'assurer une traçabilité stricte (via des Triggers et Procédures Stockées SQL) des ressources vitales (eau, tentes, kits médicaux).

## 🎥 Démo du Projet (Lien Vidéo)
> 🔗 **[https://drive.google.com/file/d/1X_Tk-gu4q68HUKOnzaEohg2Zlt0x34Vs/view?usp=sharing]**

## 📄 Rapports
Le rapport détaillé de l'architecture et de l'implémentation est disponible dans ce repository sous le nom : `Rapport_Safe_Shelter_Connect.pdf`.
BlueTeam  : `BlueTeam_PostFix_Report.pdf`.
RedTeam  : `Rapport_Security.pdf`.
TestTeam  : `rapport équipe de test.pdf`.
Augmented  : `rapport.pdf`.

## 📄 Presentations
l'architecture : `presentation_Architectes.pdf`.

## 👥 Membres de l'Équipe (Groupe 4)
Conformément aux consignes, voici les membres des filières SDBDIA & SITCN ayant collaboré sur le projet **Safe-Shelter Connect** :
- **CHITACHNI Doha**
- **EL BAGHDADI Wafae**
- **EL BOUKAA Ghait**
- **EL HAFIANE Ahmed**
- **EL HART Hamza**
- **EL KAZDIR Fatima**
- **CHOKRANI R.**
- **DAOUI Abdessamad**
- **DARBALI A. YASSER**
- **DREUICHE Mohamed**
- **EDDRIA Aya**
- **EL AOUTMANI Moncef**



## 🚀 Fonctionnalités Clés (Business Logic)
1. **Gestion des Capacités (Automatisée) :** Procédure stockée `sp_refresh_capacity` qui recalcule en temps réel les places disponibles dans les abris selon les points d'affectation occupés.
2. **Auto-Deduct Stock :** Trigger `fn_deduct_stock` qui déduit automatiquement les stocks de survie lors d'une distribution.
3. **Sécurité :** Authentification par Token JWT avec gestion des rôles (Super Admin, Admin Zone, Sinistré).
4. **Gestion des Interventions :** Affectation d'équipes de secours aux zones critiques avec suivi des statuts.

---

## 🌟 Technical Features (Extended)

### For Victims & Public
* **Zone Discovery:** Public map and list views of active shelter zones and their current capacities.
* **Authentication:** Secure split-panel login and registration flow.
* **Shelter Requests:** Victims can securely request a spot at a nearby shelter zone.
* **Dashboard:** Track reservation status (Pending, Confirmed, Rejected) and receive real-time updates.

### For Administrators
* **Role-Based Access Control:** Super Admins have global access, while Zone Admins manage their specific assigned areas.
* **Logistics & Inventory:** Distribute and restock resources (food, water, tents) with auto-assigned zone scoping.
* **Reservation Management:** Confirm or reject victim shelter requests. Automates spot allocation and zone capacity tracking.
* **Real-time Analytics:** Track critical stock levels and shelter capacities using Recharts and React Query polling.
* **Zone Management:** Super Admins can create, edit, and delete zones, complete with GPS coordinates.
* **User Management:** Super Admin interface to manage the administrative team.

---

## 🛠️ Technologies Utilisées

**Frontend:**
* React 18 / Vite
* Tailwind CSS & Custom UI Tokens
* React Router DOM (Routing)
* TanStack React Query (State Management & Polling)
* React Leaflet (Interactive mapping)
* Recharts (Data visualization)
* Radix UI / Shadcn (Accessible, headless UI components)
* Lucide React (Iconography)

**Backend:**
* Python / Flask
* Flask-SQLAlchemy (ORM)
* Flask-JWT-Extended (Authentication)
* Flask-CORS
* PyMySQL (Database driver)
* python-dotenv (Environment variables)

**Database:**
* MySQL

---

## 📂 Project Structure

```text
📦 safe-shelter-connect
 ┣ 📂 sans_ia
 ┃ ┣ 📂 backend
 ┃ ┃ ┣ 📂 routes            # Modular Flask application Blueprints
 ┃ ┃ ┣ 📂 utils             # Decorators and helper utilities
 ┃ ┃ ┣ 📜 app.py            # Main Flask application entry point
 ┃ ┃ ┣ 📜 extensions.py     # Database and JWT initialization
 ┃ ┃ ┣ 📜 models.py         # SQLAlchemy database models
 ┃ ┃ ┣ 📜 .env.example      # Example environment variables
 ┃ ┃ ┗ 📂 venv              # Python virtual environment
 ┃ ┣ 📂 frontend
 ┃ ┃ ┣ 📂 src
 ┃ ┃ ┃ ┣ 📂 api           # Axios instances and API services (auth, zone, admin)
 ┃ ┃ ┃ ┣ 📂 components    # Shared UI components (Navbar, Badge, SearchInput)
 ┃ ┃ ┃ ┣ 📂 context       # React Context (AuthContext)
 ┃ ┃ ┃ ┣ 📂 lib           # Utilities (Tailwind cn merge)
 ┃ ┃ ┃ ┗ 📂 pages         # Page components (Admin, Auth, Public, Victim)
 ┃ ┃ ┣ 📜 index.html        # Main HTML entry point
 ┃ ┃ ┣ 📜 package.json      # Frontend dependencies and scripts
 ┃ ┃ ┣ 📜 tailwind.config.js# Tailwind CSS configuration
 ┃ ┃ ┗ 📜 vite.config.js    # Vite bundler configuration
 ┃ ┗ 📜 soussmassaresilience.sql # Main database SQL schema dump
 ┣ 📜 README.md
 ┗ 📜 *.pdf (Rapports de l'équipe)
```

---

## 🚀 Installation & Setup

### Prerequisites
* [Node.js](https://nodejs.org/) (v16+)
* [Python](https://www.python.org/) (v3.9+)
* [MySQL Server](https://dev.mysql.com/downloads/)

### 1. Database Setup
1. Create a MySQL database (e.g., `safe_shelter_db`).
2. Import the `soussmassaresilience.sql` file into your MySQL database to set up the structure and seed the initial data:
```bash
mysql -u your_username -p safe_shelter_db < soussmassaresilience.sql
```

### 2. Backend Setup
```bash
cd sans_ia/backend
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install requirements
pip install Flask flask-sqlalchemy flask-jwt-extended flask-cors pymysql python-dotenv

# Configure environment variables
cp .env.example .env
# Edit .env and update DB_USER, DB_PASSWORD, DB_HOST, DB_NAME

# Run the Flask server
python app.py
```
*The backend server will run on `http://127.0.0.1:5000`.*

### 3. Frontend Setup
```bash
cd sans_ia/frontend
npm install

# Run the development server
npm run dev
```
*The frontend application will be available at `http://localhost:5173`.*

---

## 💻 Usage

1. **Public Browse:** Visit the homepage to view active zones and capacities without logging in.
2. **Victim Registration:** Create an account to request a shelter spot at an available zone.
3. **Admin Dashboard:** Log in using admin credentials to access the internal portal.
   - Use the **Zones** tab to manage physical shelter locations.
   - Use the **Logistics** tab to distribute and restock inventory.
   - Use the **Reservations** tab to approve or reject pending victim requests.

---

## ⚙️ Configuration

The backend relies on the `.env` file for database connectivity and security. Ensure the following variables are correctly set:
```env
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_HOST=localhost
DB_NAME=your_database_name
JWT_SECRET_KEY=your_secure_jwt_secret
```
