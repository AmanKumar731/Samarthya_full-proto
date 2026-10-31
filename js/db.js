// ============================================
// Samarthya — Self-Contained MVP Database Engine
// Persistent Storage for Users, Applications & Admin Management
// ============================================

const SamarthyaDB = {
  DB_KEY_USERS: 'samarthya_db_users',
  DB_KEY_APPS: 'samarthya_db_applications',
  DB_KEY_SCHEMES: 'samarthya_db_custom_schemes',
  DB_KEY_LOGS: 'samarthya_db_logs',

  // Default Seed Data
  defaultAdmin: {
    id: 'admin_root',
    name: 'Director General (Disability Welfare)',
    email: 'admin@samarthya.gov.in',
    password: 'admin@123',
    role: 'admin',
    department: 'Department of Empowerment of Persons with Disabilities',
    ministry: 'Ministry of Social Justice and Empowerment',
    phone: '+91 11 2436 9054',
    state: 'Delhi (National Headquarters)',
    verified: true,
    avatar: '👑',
    createdAt: '2026-01-01'
  },

  defaultUsers: [
    {
      id: 'user_aarav',
      name: 'Aarav Sharma',
      email: 'aarav@student.in',
      password: 'password123',
      role: 'user',
      phone: '+91 98765 43210',
      dob: '2005-04-12',
      state: 'delhi',
      gender: 'male',
      disability: 'Visual Impairment (Blindness)',
      disabilityType: 'blindness',
      disabilityPercent: 75,
      education: 'graduate',
      income: 180000,
      udid: 'DL-01-2023-0098765',
      verified: true,
      avatar: 'A',
      registeredAt: '2026-02-01',
      matchedCount: 9,
      estBenefit: '₹62,000 / yr'
    },
    {
      id: 'user_priya',
      name: 'Priya Verma',
      email: 'priya.verma@gmail.com',
      password: 'password123',
      role: 'user',
      phone: '+91 87654 32109',
      dob: '2003-08-20',
      state: 'uttar_pradesh',
      gender: 'female',
      disability: 'Locomotor Disability',
      disabilityType: 'locomotor_disability',
      disabilityPercent: 60,
      education: 'graduate',
      income: 250000,
      udid: 'UP-09-2024-0012345',
      verified: true,
      avatar: 'P',
      registeredAt: '2026-02-10',
      matchedCount: 7,
      estBenefit: '₹48,000 / yr'
    },
    {
      id: 'user_sunita',
      name: 'Sunita Sharma',
      email: 'sunita.sharma@gmail.com',
      password: 'password123',
      role: 'user',
      phone: '+91 99887 76655',
      dob: '2003-05-14',
      state: 'uttar_pradesh',
      gender: 'female',
      disability: 'Locomotor Disability',
      disabilityType: 'locomotor_disability',
      disabilityPercent: 55,
      education: 'graduate',
      income: 150000,
      udid: 'UP14200305140029',
      verified: true,
      avatar: 'S',
      registeredAt: '2026-02-14',
      matchedCount: 11,
      estBenefit: '₹75,000 / yr'
    },
    {
      id: 'user_rahul',
      name: 'Rahul Verma',
      email: 'rahul.verma@gmail.com',
      password: 'password123',
      role: 'user',
      phone: '+91 91234 56789',
      dob: '2005-09-20',
      state: 'delhi',
      gender: 'male',
      disability: 'Visual Impairment',
      disabilityType: 'blindness',
      disabilityPercent: 75,
      education: 'higher_secondary',
      income: 100000,
      udid: 'DL08200509200084',
      verified: true,
      avatar: 'R',
      registeredAt: '2026-02-18',
      matchedCount: 8,
      estBenefit: '₹55,000 / yr'
    },
    {
      id: 'user_amit',
      name: 'Amit Patel',
      email: 'amit.patel@gmail.com',
      password: 'password123',
      role: 'user',
      phone: '+91 98760 12345',
      dob: '2002-11-12',
      state: 'maharashtra',
      gender: 'male',
      disability: 'Hearing Impairment',
      disabilityType: 'deaf',
      disabilityPercent: 60,
      education: 'post_graduate',
      income: 250000,
      udid: 'MH22200211120019',
      verified: true,
      avatar: 'A',
      registeredAt: '2026-02-22',
      matchedCount: 6,
      estBenefit: '₹40,000 / yr'
    }
  ],

  defaultApplications: [
    {
      id: 'APP-2026-8819',
      userId: 'user_aarav',
      userName: 'Aarav Sharma',
      userEmail: 'aarav@student.in',
      schemeId: 'post_matric_pwd',
      schemeName: 'Post-Matric Scholarship for Students with Disabilities',
      ministry: 'DEPwD, Govt of India',
      appliedDate: '2026-02-12',
      deadline: '2026-03-31',
      status: 'verification', // draft, applied, verification, review, approved, disbursed
      benefitAmount: '₹48,000 / year',
      udid: 'DL-01-2023-0098765',
      documents: ['UDID Card', 'Fee Receipt', 'Income Cert'],
      notes: 'Initial documents verified by District Officer.'
    },
    {
      id: 'APP-2026-9204',
      userId: 'user_priya',
      userName: 'Priya Verma',
      userEmail: 'priya.verma@gmail.com',
      schemeId: 'adip_scheme',
      schemeName: 'ADIP Scheme (Free Motorized Wheelchair)',
      ministry: 'Ministry of Social Justice and Empowerment',
      appliedDate: '2026-01-25',
      deadline: '2026-04-15',
      status: 'approved',
      benefitAmount: 'Motorized Tricycle (₹37,000 value)',
      udid: 'UP-09-2024-0012345',
      documents: ['Disability Certificate 60%', 'Aadhaar Card'],
      notes: 'Sanctioned under ALIMCO Camp Drive.'
    },
    {
      id: 'APP-2026-7412',
      userId: 'user_sunita',
      userName: 'Sunita Sharma',
      userEmail: 'sunita.sharma@gmail.com',
      schemeId: 'top_class_education_pwd',
      schemeName: 'Top Class Education Scheme for Students with Disabilities',
      ministry: 'DEPwD, Govt of India',
      appliedDate: '2026-02-18',
      deadline: '2026-05-15',
      status: 'review',
      benefitAmount: 'Full Tuition Waiver + ₹3,000/mo',
      udid: 'UP14200305140029',
      documents: ['Institute Admission Letter', 'UDID Card'],
      notes: 'Under review by National Nodal Officer.'
    },
    {
      id: 'APP-2026-5531',
      userId: 'user_rahul',
      userName: 'Rahul Verma',
      userEmail: 'rahul.verma@gmail.com',
      schemeId: 'pre_matric_pwd',
      schemeName: 'Pre-Matric Scholarship for Special Students',
      ministry: 'DEPwD, Govt of India',
      appliedDate: '2026-02-20',
      deadline: '2026-03-31',
      status: 'applied',
      benefitAmount: '₹25,000 / year',
      udid: 'DL08200509200084',
      documents: ['School Certificate', 'Disability Cert 75%'],
      notes: 'Application received via NSP Portal.'
    }
  ],

  // --------- Database Initialization ---------
  init() {
    // Check and seed Users table
    if (!localStorage.getItem(this.DB_KEY_USERS)) {
      const allUsers = [this.defaultAdmin, ...this.defaultUsers];
      localStorage.setItem(this.DB_KEY_USERS, JSON.stringify(allUsers));
    }

    // Check and seed Applications table
    if (!localStorage.getItem(this.DB_KEY_APPS)) {
      localStorage.setItem(this.DB_KEY_APPS, JSON.stringify(this.defaultApplications));
    }

    // Audit logs
    if (!localStorage.getItem(this.DB_KEY_LOGS)) {
      localStorage.setItem(this.DB_KEY_LOGS, JSON.stringify([
        { action: 'DB_INIT', details: 'Database initialized with 5 users and 1 admin record', timestamp: new Date().toISOString() }
      ]));
    }
  },

  // --------- USERS TABLE OPERATIONS ---------
  getAllUsers() {
    try {
      const data = localStorage.getItem(this.DB_KEY_USERS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  getUserByEmail(email) {
    const users = this.getAllUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase().trim() || (u.udid && u.udid.toLowerCase() === email.toLowerCase().trim()));
  },

  getUserById(id) {
    const users = this.getAllUsers();
    return users.find(u => u.id === id);
  },

  saveUser(user) {
    const users = this.getAllUsers();
    const idx = users.findIndex(u => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
    if (idx >= 0) {
      users[idx] = { ...users[idx], ...user, updatedAt: new Date().toISOString() };
    } else {
      user.id = user.id || 'user_' + Date.now();
      user.registeredAt = user.registeredAt || new Date().toISOString().split('T')[0];
      user.role = user.role || 'user';
      users.push(user);
    }
    localStorage.setItem(this.DB_KEY_USERS, JSON.stringify(users));
    this.logAction('USER_SAVE', `Saved profile for ${user.name} (${user.email})`);
    return user;
  },

  deleteUser(userId) {
    let users = this.getAllUsers();
    const target = users.find(u => u.id === userId);
    if (target && target.role === 'admin') {
      alert('Cannot delete the root Administrator account.');
      return false;
    }
    users = users.filter(u => u.id !== userId);
    localStorage.setItem(this.DB_KEY_USERS, JSON.stringify(users));
    this.logAction('USER_DELETE', `Deleted user ${userId}`);
    return true;
  },

  verifyUserUDID(userId, status = true) {
    const users = this.getAllUsers();
    const user = users.find(u => u.id === userId);
    if (user) {
      user.verified = status;
      localStorage.setItem(this.DB_KEY_USERS, JSON.stringify(users));
      this.logAction('USER_VERIFY', `Set UDID verification to ${status} for ${user.name}`);
      return true;
    }
    return false;
  },

  // --------- APPLICATIONS TABLE OPERATIONS ---------
  getAllApplications() {
    try {
      const data = localStorage.getItem(this.DB_KEY_APPS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  getUserApplications(userId) {
    const apps = this.getAllApplications();
    return apps.filter(a => a.userId === userId);
  },

  saveApplication(app) {
    const apps = this.getAllApplications();
    const idx = apps.findIndex(a => a.id === app.id);
    if (idx >= 0) {
      apps[idx] = { ...apps[idx], ...app, updatedAt: new Date().toISOString() };
    } else {
      app.id = app.id || 'APP-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
      app.appliedDate = app.appliedDate || new Date().toISOString().split('T')[0];
      apps.unshift(app);
    }
    localStorage.setItem(this.DB_KEY_APPS, JSON.stringify(apps));
    this.logAction('APP_SAVE', `Application ${app.id} updated to status: ${app.status}`);
    return app;
  },

  updateApplicationStatus(appId, newStatus, adminNote = '') {
    const apps = this.getAllApplications();
    const app = apps.find(a => a.id === appId);
    if (app) {
      app.status = newStatus;
      if (adminNote) app.notes = adminNote;
      app.updatedAt = new Date().toISOString();
      localStorage.setItem(this.DB_KEY_APPS, JSON.stringify(apps));
      this.logAction('APP_STATUS_CHANGE', `Application ${appId} changed to ${newStatus}`);
      return true;
    }
    return false;
  },

  deleteApplication(appId) {
    let apps = this.getAllApplications();
    apps = apps.filter(a => a.id !== appId);
    localStorage.setItem(this.DB_KEY_APPS, JSON.stringify(apps));
    this.logAction('APP_DELETE', `Deleted application ${appId}`);
    return true;
  },

  // --------- AUDIT LOGGING ---------
  logAction(action, details) {
    try {
      const logs = JSON.parse(localStorage.getItem(this.DB_KEY_LOGS) || '[]');
      const actor = (typeof Auth !== 'undefined' && Auth && Auth.currentUser) ? Auth.currentUser.email : 'System';
      logs.unshift({
        action,
        details,
        timestamp: new Date().toISOString(),
        actor: actor
      });
      if (logs.length > 200) logs.pop();
      localStorage.setItem(this.DB_KEY_LOGS, JSON.stringify(logs));
    } catch (e) {}
  },

  getAuditLogs() {
    try {
      return JSON.parse(localStorage.getItem(this.DB_KEY_LOGS) || '[]');
    } catch (e) {
      return [];
    }
  },

  // --------- DATABASE METRICS ---------
  getStats() {
    const users = this.getAllUsers().filter(u => u.role !== 'admin');
    const apps = this.getAllApplications();
    const verifiedCount = users.filter(u => u.verified).length;
    const approvedCount = apps.filter(a => a.status === 'approved' || a.status === 'disbursed').length;

    let totalDisbursedValue = 0;
    apps.forEach(a => {
      if (a.status === 'approved' || a.status === 'disbursed') {
        const num = (a.benefitAmount || '').match(/₹([\d,]+)/);
        if (num) totalDisbursedValue += parseInt(num[1].replace(/,/g, ''));
        else totalDisbursedValue += 35000;
      }
    });

    return {
      totalUsers: users.length,
      verifiedUsers: verifiedCount,
      totalApplications: apps.length,
      approvedApplications: approvedCount,
      pendingVerifications: apps.filter(a => a.status === 'applied' || a.status === 'verification').length,
      totalSanctionedValue: totalDisbursedValue || 185000
    };
  }
};

// Auto-initialize DB
SamarthyaDB.init();
window.SamarthyaDB = SamarthyaDB;
