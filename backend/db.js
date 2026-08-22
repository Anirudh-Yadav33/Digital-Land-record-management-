const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_FILE = path.join(__dirname, 'data.json');

// Initial seed dataset
function getInitialData() {
  const hashedPassword = bcrypt.hashSync('password123', 10);

  return {
    users: [
      {
        id: 'usr_1',
        name: 'Rajesh Kumar',
        email: 'user@land.gov',
        password: hashedPassword,
        role: 'user',
        idNumber: 'AD-9876-5432-1098',
        phone: '+1 (555) 234-5678',
        address: '42 Green Valley Sector 7, Cyber City',
        createdAt: '2024-01-10T10:00:00Z'
      },
      {
        id: 'usr_2',
        name: 'Sita Sharma',
        email: 'sita@land.gov',
        password: hashedPassword,
        role: 'user',
        idNumber: 'AD-1122-3344-5566',
        phone: '+1 (555) 876-5432',
        address: '108 Sunrise Hills Phase 2',
        createdAt: '2024-02-15T11:30:00Z'
      },
      {
        id: 'usr_admin',
        name: 'Inspector Vikram Singh',
        email: 'admin@land.gov',
        password: hashedPassword,
        role: 'admin',
        idNumber: 'GOV-REG-8821-ADM',
        phone: '+1 (555) 900-1122',
        address: 'Central Land Registry HQ, Bureau of Cadastral Control',
        createdAt: '2023-05-01T08:00:00Z'
      }
    ],

    lands: [
      {
        id: 'LAND-2024-001',
        pin: 'PIN-883920-A1',
        title: 'Green Valley Plot #42',
        ownerId: 'usr_1',
        ownerName: 'Rajesh Kumar',
        ownerEmail: 'user@land.gov',
        ownerIdNumber: 'AD-9876-5432-1098',
        district: 'Central Metropolitan',
        sector: 'Sector 7',
        areaSqFt: 2400,
        zone: 'Residential',
        valuationUsd: 185000,
        taxStatus: 'PAID',
        taxValidTill: '2027-12-31',
        status: 'ACTIVE',
        deedRef: 'DEED-REG-991823',
        registrationDate: '2021-04-12',
        coordinates: [
          { x: 120, y: 80 },
          { x: 220, y: 80 },
          { x: 220, y: 180 },
          { x: 120, y: 180 }
        ],
        documents: [
          { name: 'Original_Deed_Certificate.pdf', type: 'Title Deed', url: '/uploads/sample_deed.pdf' },
          { name: 'Survey_Cadastral_Plan.pdf', type: 'Survey Map', url: '/uploads/sample_survey.pdf' }
        ],
        history: [
          { date: '2021-04-12', event: 'Property Registered & Deed Issued', actor: 'Central Registry Office' },
          { date: '2024-01-05', event: 'Property Tax Paid for 2024-2027', actor: 'Rajesh Kumar' }
        ]
      },
      {
        id: 'LAND-2024-002',
        pin: 'PIN-994011-B5',
        title: 'Sunrise Hills Commercial Plot #108',
        ownerId: 'usr_2',
        ownerName: 'Sita Sharma',
        ownerEmail: 'sita@land.gov',
        ownerIdNumber: 'AD-1122-3344-5566',
        district: 'North Hills District',
        sector: 'Phase 2',
        areaSqFt: 5000,
        zone: 'Commercial',
        valuationUsd: 420000,
        taxStatus: 'PAID',
        taxValidTill: '2026-12-31',
        status: 'ACTIVE',
        deedRef: 'DEED-REG-443210',
        registrationDate: '2022-09-05',
        coordinates: [
          { x: 300, y: 200 },
          { x: 450, y: 200 },
          { x: 450, y: 320 },
          { x: 300, y: 320 }
        ],
        documents: [
          { name: 'Commercial_Deed_Certificate.pdf', type: 'Title Deed', url: '/uploads/sample_deed.pdf' },
          { name: 'Environmental_Clearance.pdf', type: 'Approval', url: '/uploads/sample_survey.pdf' }
        ],
        history: [
          { date: '2022-09-05', event: 'Property Registered & Deed Issued', actor: 'North Hills Cadastral Officer' }
        ]
      }
    ],

    applications: [
      {
        id: 'APP-2026-8801',
        applicantId: 'usr_1',
        applicantName: 'Rajesh Kumar',
        applicantEmail: 'user@land.gov',
        applicantIdNumber: 'AD-9876-5432-1098',
        applicantPhone: '+1 (555) 234-5678',
        propertyTitle: 'Meadow View Plot #14',
        district: 'Central Metropolitan',
        sector: 'Sector 12',
        areaSqFt: 1800,
        zone: 'Residential',
        proposedValuationUsd: 135000,
        sellerName: 'Anand Verma',
        sellerIdNumber: 'AD-4433-2211-0099',
        previousDeedRef: 'OLD-DEED-3321',
        coordinates: [
          { x: 500, y: 60 },
          { x: 620, y: 60 },
          { x: 620, y: 160 },
          { x: 500, y: 160 }
        ],
        documents: [
          { id: 'doc_1', name: 'Citizen_ID_Rajesh.pdf', type: 'ID Proof', filename: 'sample_id.pdf', url: '/uploads/sample_id.pdf' },
          { id: 'doc_2', name: 'Sale_Agreement_v2.pdf', type: 'Sale Deed', filename: 'sample_deed.pdf', url: '/uploads/sample_deed.pdf' },
          { id: 'doc_3', name: 'Cadastral_Survey_Sector12.pdf', type: 'Survey Map', filename: 'sample_survey.pdf', url: '/uploads/sample_survey.pdf' }
        ],
        status: 'PENDING',
        fraudRisk: {
          score: 5,
          level: 'LOW',
          reasons: [
            'PASSED ALL AUTOMATED CHECKS: Clear title history, valid coordinates, normal pricing, and full documentation.'
          ]
        },
        submittedAt: '2026-08-15T09:30:00Z',
        inspectorNotes: null,
        reviewedAt: null,
        reviewedBy: null
      },
      {
        id: 'APP-2026-9904',
        applicantId: 'usr_fake',
        applicantName: 'Unknown Syndicate / Fake Entity',
        applicantEmail: 'scam@fake.org',
        applicantIdNumber: 'AD-0000-1111-2222',
        applicantPhone: '+1 (555) 000-9999',
        propertyTitle: 'Disputed Green Valley Sector 7 Parcel B',
        district: 'Central Metropolitan',
        sector: 'Sector 7',
        areaSqFt: 2400,
        zone: 'Residential',
        proposedValuationUsd: 35000,
        sellerName: 'Suspicious Shadow Seller',
        sellerIdNumber: 'UNVERIFIED-ID',
        previousDeedRef: 'FORGED-DEED-999',
        coordinates: [
          { x: 140, y: 90 },
          { x: 230, y: 90 },
          { x: 230, y: 190 },
          { x: 140, y: 190 }
        ],
        documents: [
          { id: 'doc_fake', name: 'Single_Suspect_Scan.pdf', type: 'Sale Deed', filename: 'suspect.pdf', url: '/uploads/suspect.pdf' }
        ],
        status: 'FLAGGED_FRAUD',
        fraudRisk: {
          score: 88,
          level: 'CRITICAL',
          reasons: [
            'CRITICAL OVERLAP: 82% spatial overlap detected with registered property LAND-2024-001 (Owner: Rajesh Kumar).',
            'PRICE ANOMALY: Proposed valuation ($35,000) is 81.0% below the sector average benchmark ($185,000).',
            'SELLER RISK: Seller Identification "UNVERIFIED-ID" could not be cross-checked with National Tax Database.',
            'MISSING MANDATORY DOCS: Missing required ID Proof and Survey Map documentation.'
          ]
        },
        submittedAt: '2026-08-16T14:10:00Z',
        inspectorNotes: 'Automated Fraud Audit engine flagged critical boundary overlap and severe price anomaly.',
        reviewedAt: '2026-08-16T14:11:00Z',
        reviewedBy: 'SYSTEM_FRAUD_ENGINE'
      }
    ],

    auditLogs: [
      {
        id: 'log_1',
        timestamp: '2026-08-15T09:30:00Z',
        action: 'APPLICATION_SUBMITTED',
        user: 'user@land.gov',
        details: 'Submitted property registration application APP-2026-8801 for Meadow View Plot #14.'
      },
      {
        id: 'log_2',
        timestamp: '2026-08-16T14:11:00Z',
        action: 'FRAUD_FLAGGED',
        user: 'SYSTEM_FRAUD_ENGINE',
        details: 'Application APP-2026-9904 flagged for CRITICAL fraud risk (Score 88/100).'
      }
    ]
  };
}

class JSONDatabase {
  constructor() {
    this.init();
  }

  init() {
    if (!fs.existsSync(DB_FILE)) {
      const initial = getInitialData();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
    }
  }

  read() {
    try {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(data);
    } catch (err) {
      console.error('Error reading database file:', err);
      return getInitialData();
    }
  }

  write(data) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
      return true;
    } catch (err) {
      console.error('Error writing to database file:', err);
      return false;
    }
  }

  // Users
  getUserByEmail(email) {
    const db = this.read();
    return db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  getUserById(id) {
    const db = this.read();
    return db.users.find(u => u.id === id);
  }

  createUser(userData) {
    const db = this.read();
    db.users.push(userData);
    this.write(db);
    return userData;
  }

  // Land Records
  getAllLands() {
    const db = this.read();
    return db.lands;
  }

  getLandsByOwner(ownerId) {
    const db = this.read();
    return db.lands.filter(l => l.ownerId === ownerId || l.ownerEmail === ownerId);
  }

  getLandById(id) {
    const db = this.read();
    return db.lands.find(l => l.id === id || l.pin === id);
  }

  addLandRecord(landRecord) {
    const db = this.read();
    db.lands.push(landRecord);
    this.write(db);
    return landRecord;
  }

  // Registration Applications
  getAllApplications() {
    const db = this.read();
    return db.applications;
  }

  getApplicationsByUser(userId) {
    const db = this.read();
    return db.applications.filter(a => a.applicantId === userId || a.applicantEmail === userId);
  }

  getApplicationById(id) {
    const db = this.read();
    return db.applications.find(a => a.id === id);
  }

  createApplication(appData) {
    const db = this.read();
    db.applications.unshift(appData);
    this.write(db);
    return appData;
  }

  updateApplicationStatus(id, status, inspectorNotes, reviewedBy, fraudRisk = null) {
    const db = this.read();
    const app = db.applications.find(a => a.id === id);
    if (!app) return null;

    app.status = status;
    app.inspectorNotes = inspectorNotes;
    app.reviewedBy = reviewedBy;
    app.reviewedAt = new Date().toISOString();
    if (fraudRisk) app.fraudRisk = fraudRisk;

    this.write(db);
    return app;
  }

  // Audit Logs
  addAuditLog(action, user, details) {
    const db = this.read();
    const log = {
      id: 'log_' + Date.now(),
      timestamp: new Date().toISOString(),
      action,
      user,
      details
    };
    db.auditLogs.unshift(log);
    this.write(db);
    return log;
  }

  getAuditLogs() {
    const db = this.read();
    return db.auditLogs;
  }
}

module.exports = new JSONDatabase();
