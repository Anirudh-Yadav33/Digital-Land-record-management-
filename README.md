# Digital Land Record and Property Registration Platform

A full-stack, enterprise-grade Digital Land Registry Platform built with **Node.js, Express, HTML5, CSS3 (Glassmorphism & Dark Theme), Docker, and Docker Compose**.

Featuring role-based access control for Citizens and Land Registry Inspectors, automated AI boundary overlap & fraud risk scoring, digital deed certificate issuance, step-by-step property registration wizard, and a searchable public cadastral land ledger.
## Development Branch

This section was added while working on the development branch.
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

The platform comes pre-seeded with sample user accounts and land records for instant demonstration:

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Citizen** | `user@land.gov` | `password123` | Rajesh Kumar (Owns GREEN VALLEY Plot #42) |
| **Citizen** | `sita@land.gov` | `password123` | Sita Sharma (Owns SUNRISE HILLS Plot #108) |
| **Inspector (Admin)** | `admin@land.gov` | `password123` | Inspector Vikram Singh (Registry HQ) |

> ⚡ **Tip**: Use the **Quick Switcher Chips** at the top of the web UI to sign in instantly with 1 click!

---

## 🚀 How to Run Locally

### Option 1: Running with Node.js directly

```bash
# 1. Install dependencies
npm install

# 2. Start the server
npm start
```
Open your browser and navigate to: **`http://localhost:3000`**

---

### Option 2: Running with Docker & Docker Compose

```bash
# Launch container with single command
docker-compose up --build
```
Access the application at: **`http://localhost:3000`**

---

## 📁 Project Structure

```
.
├── Dockerfile                  # Container definition for Node.js server
├── docker-compose.yml          # Container orchestration & volume mapping
├── package.json                # Project manifest and dependencies
├── server.js                   # Express REST API, auth & file upload routes
├── db.js                       # Persistent data store with pre-seeded datasets
├── fraudEngine.js              # Algorithmic fraud scoring & spatial overlap engine
├── uploads/                    # Uploaded cadastral documents & mock deeds
├── public/
│   ├── index.html              # Single Page Application HTML markup
│   ├── css/
│   │   └── style.css           # Glassmorphism design system & responsive layout
│   └── js/
│       └── app.js              # Frontend SPA router, state & HTML5 map renderer
└── README.md                   # System documentation
```
