# Safe-Shelter Connect

An emergency response and logistics coordination platform designed to link earthquake survivors with safe zones and real-time resources. Safe-Shelter Connect provides a public-facing portal for victims to find and request shelter, alongside a powerful admin dashboard for managing logistics, inventory, and zone capacity in real-time.

---

## 🌟 Features

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

## 🛠️ Technologies Used

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
 ┣ 📂 backend
 ┃ ┣ 📜 app.py            # Main Flask application and API routes
 ┃ ┣ 📜 models.py         # SQLAlchemy database models
 ┃ ┣ 📜 .env.example      # Example environment variables
 ┃ ┗ 📂 venv              # Python virtual environment
 ┣ 📂 frontend
 ┃ ┣ 📂 src
 ┃ ┃ ┣ 📂 api           # Axios instances and API services (auth, zone, admin)
 ┃ ┃ ┣ 📂 components    # Shared UI components (Navbar, Badge, SearchInput)
 ┃ ┃ ┣ 📂 context       # React Context (AuthContext)
 ┃ ┃ ┣ 📂 lib           # Utilities (Tailwind cn merge)
 ┃ ┃ ┗ 📂 pages         # Page components (Admin, Auth, Public, Victim)
 ┃ ┣ 📜 index.html        # Main HTML entry point
 ┃ ┣ 📜 package.json      # Frontend dependencies and scripts
 ┃ ┣ 📜 tailwind.config.js# Tailwind CSS configuration
 ┃ ┗ 📜 vite.config.js    # Vite bundler configuration
 ┣ 📜 soussmassaresilience.sql # Main database SQL schema dump
 ┗ 📜 README.md
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
cd backend
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
cd frontend
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

---

## 📸 Screenshots
*(TODO: Add screenshots showcasing the Split-panel authentication, Interactive Shelter Map, and Admin Logistics Dashboard)*

---

## 🤝 Contributing
Contributions are welcome! Please format your pull requests clearly and adhere to the project's React structure and Tailwind design tokens.

---

## 📄 License
This project is licensed under the MIT License.
