# Digital Land Record and Property Registration Platform

A decoupled, enterprise-grade Digital Land Registry Platform built with **Node.js, Express, HTML5, CSS3 (Glassmorphism & Dark Theme), Nginx, Docker, and Docker Compose**.

The architecture separates the **Frontend (Port 3000)** and **Backend (Port 5000)** into dedicated microservice directories with independent `Dockerfile` configurations.

---

## 🏗️ Architecture & Decoupled Service Setup

```
Digital land/
├── frontend/                   # Frontend Microservice Directory
│   ├── public/                 # Static UI assets (index.html, css/style.css, js/app.js)
│   ├── nginx.conf              # Nginx web server & reverse proxy configuration
│   └── Dockerfile              # Docker image definition for Frontend UI (Port 3000 -> 80)
├── backend/                    # Backend API Microservice Directory
│   ├── server.js               # Express REST API, auth & file upload routes (Port 5000)
│   ├── db.js                   # Persistent data store with initial seed datasets
│   ├── fraudEngine.js          # Algorithmic fraud scoring & spatial overlap engine
│   ├── package.json            # Node.js backend dependencies
│   ├── uploads/                # Cadastral documents & sample title deeds
│   └── Dockerfile              # Docker image definition for Backend API (Port 5000)
├── docker-compose.yml          # Container orchestration for dual services
└── README.md                   # System documentation
```

### Port Allocation:
- **Frontend Service**: Runs on **`http://localhost:3000`** (Nginx container serving static UI and proxying API traffic).
- **Backend Service**: Runs on **`http://localhost:5000`** (Express REST API handling auth, ledger search, and fraud checks).

---

## 🌟 Key Features

1. **Role-Based Portals**:
   - **Citizen Portal**: View verified land titles, official government deed certificates, spatial boundary maps, tax status, and track property registration applications.
   - **Admin / Inspector Verification Portal**: Inspection queue for pending applications, automated AI fraud scoring, spatial boundary conflict detection, approval/rejection pipeline, and audit logging.

2. **Automated Algorithmic Fraud Detection Engine**:
   - **Spatial Overlap Audit**: Calculates polygon bounding box overlap with existing registered plots (flags double selling / encroached land).
   - **Market Price Anomaly Detection**: Flags registrations proposed at >40% below or >250% above sector benchmark values (stamp duty evasion / money laundering indicators).
   - **Seller & Document Checklist Verification**: Checks missing mandatory files (ID Proof, Sale Deed, Cadastral Survey Map) and unverified seller IDs.

3. **Public Cadastral Title Search**:
   - Publicly searchable ledger by Unique Property PIN, Owner Name, District, or Title Deed reference with dynamic HTML5 Canvas plot maps.

---

## 🔑 Pre-Seeded Login Credentials

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Citizen** | `user@land.gov` | `password123` | Rajesh Kumar (Owns GREEN VALLEY Plot #42) |
| **Citizen** | `sita@land.gov` | `password123` | Sita Sharma (Owns SUNRISE HILLS Plot #108) |
| **Inspector (Admin)** | `admin@land.gov` | `password123` | Inspector Vikram Singh (Registry HQ) |

> ⚡ **Tip**: Use the **Quick Switcher Chips** at the top of the web UI to sign in instantly with 1 click!

---

## 🚀 How to Run with Docker & Docker Compose

### 1. Build and Run Both Services via Docker Compose
```bash
docker-compose up --build
```

### 2. Building and Running Individual Docker Images

**Frontend Container (Port 3000)**:
```bash
# Build image
docker build -t digital-land-frontend ./frontend

# Run container
docker run -d -p 3000:80 --name frontend_app digital-land-frontend
```

**Backend Container (Port 5000)**:
```bash
# Build image
docker build -t digital-land-backend ./backend

# Run container
docker run -d -p 5000:5000 --name backend_app digital-land-backend
```

---

## 💻 How to Run Locally without Docker

**Backend API**:
```bash
cd backend
npm install
npm start
```
*Backend API will run live at `http://localhost:5000`*

**Frontend UI**:
Serve `./frontend/public` using any static web server (or access via Nginx).
