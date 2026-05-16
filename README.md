# 🩺 Swasthya Connect: The Ultimate Healthcare Ecosystem for Nepal

![Swasthya Connect Banner](https://img.shields.io/badge/Status-Production--Ready-success?style=for-the-badge)
![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue?style=for-the-badge)
![Socket.IO](https://img.shields.io/badge/Real--Time-Socket.IO-black?style=for-the-badge)
![Telehealth](https://img.shields.io/badge/Telehealth-Agora-orange?style=for-the-badge)

Swasthya Connect is not just another medical app; it is a **comprehensive, real-time healthcare infrastructure** designed specifically for the Nepalese market. It bridges the gap between patients, healthcare professionals, and pharmacies through a unified, high-performance ecosystem.

---

## 🌐 Project Philosophy

In Nepal, accessing quality healthcare often involves long queues, fragmented medical records, and difficulties in finding verified medicines. **Swasthya Connect** solves this by centralizing:
1.  **Access**: Consult with top doctors via Video, Audio, or Chat from anywhere.
2.  **Affordability**: Real-time price comparison and smart pharmacy recommendations.
3.  **Adherence**: Automated reminders for medication and follow-ups.
4.  **Authenticity**: A rigorous verification portal for all medical practitioners.

---

## 🚀 The Multi-Role Ecosystem

### 👤 1. The Patient Dashboard (The Health Hub)
Patients enjoy a premium, high-data interface that tracks their entire medical journey.
- **Smart Stats**: Real-time data on consultation frequency, health expenditure, and upcoming appointments with month-over-month growth analytics.
- **Smart Store**: An AI-driven "Prescribed for You" module that fuzzy-matches your digital prescriptions with live inventory from nearby pharmacies.
- **Omni-Channel Reminders**: Never miss a dose with automated reminders delivered via **Email** and **WhatsApp**.
- **Unified Ledger**: A complete history of all payments made via **eSewa** or **Khalti**.

### 🩺 2. The Doctor Dashboard (The Virtual Clinic)
Designed to help doctors manage their practice with zero overhead.
- **Tri-Mode Telehealth**: One-click join for High-Definition Video, Audio, or low-latency Chat powered by **Agora RTC**.
- **Digital Prescription Pad**: A sophisticated UI for writing prescriptions that automatically generates professional PDFs for patients.
- **Availability Engine**: Fine-grained control over consulting hours and slot management.
- **Earning Analytics**: Track daily and monthly revenue from consultations.

### 💊 3. The Pharmacy Portal (The Digital Dispensary)
Turning local pharmacies into high-tech e-commerce hubs.
- **Real-Time Inventory**: Manage thousands of medicines with stock levels, expiry tracking, and public/private visibility toggles.
- **Prescription Workflow**: A dedicated area to verify patient-uploaded prescriptions, chat for clarifications, and generate digital bills.
- **Stock Reservation**: Automatic "locking" of inventory during the checkout process to prevent double-selling.

### 🔴 4. The Admin Command Center (The Platform Guard)
The brain of the platform, ensuring safety and compliance.
- **Practitioner Verification**: A side-by-side document review interface to verify the authenticity of Doctors and Pharmacies before they go live.
- **Global Analytics**: View platform-wide growth, user retention, and financial health.
- **System Control**: Manage user roles, deactivation, and platform-wide configurations.

---

## 🛠️ Deep-Dive Technical Architecture

### **The Real-Time Backbone (Socket.IO)**
The entire platform is "alive." 
- **Instant Messaging**: Real-time chat with typing indicators, read receipts, and online status.
- **Platform-Wide Alerts**: Users receive instant toast notifications for consultation approvals, prescription verifications, and order updates, even if they aren't on the specific page.
- **Active Sync**: The UI updates automatically when a payment is confirmed or a status changes.

### **Telehealth Engine (Agora RTC)**
We utilize **Agora's Global Network** to ensure crystal-clear communication even on low-bandwidth connections typical in rural areas. The system supports:
- Dynamic token generation for secure sessions.
- Automatic reconnection logic.
- Background session tracking (Consultation Expiry Checker).

### **Automated Workflows (Node-Cron)**
Our background engine never sleeps:
- **Medicine Reminders**: Every minute, the system checks for pending doses and fires off WhatsApp/Email alerts.
- **Consultation Guard**: Every 5 minutes, it identifies no-shows, marks consultations as "Expired," and triggers automated refund flows.

### **Financial Integration (eSewa & Khalti)**
Securely integrated with Nepal's leading gateways:
- **HMAC-SHA256 Signatures**: Used for eSewa v2 to ensure zero-tamper transactions.
- **Pending Booking Logic**: A robust system that stores booking data temporarily during the payment redirect to ensure data integrity.

---

## 🛡️ Security & Performance

- **NoSQL Injection Protection**: Every query is sanitized using `express-mongo-sanitize`.
- **XSS Protection**: User-generated content is cleaned using `xss` to prevent script injection.
- **Role-Based Access Control (RBAC)**: Strict JWT-based guarding of all routes.
- **Stock Reservation System**: Prevents race conditions during simultaneous pharmacy purchases.

---

## ⚙️ Installation & Developer Setup

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas account
- Agora App ID
- WhatsApp Cloud API Token (Optional for reminders)

### Setup Steps
1. **Clone & Install**:
   ```bash
   git clone https://github.com/your-repo/swasthya-connect.git
   cd swasthya-connect
   npm install && cd Swathya_Connect && npm install && cd ../Swathya_Connect_Backend && npm install
   ```

2. **Environment Configuration**:
   Create a `.env` in the backend folder with:
   - `MONGO_URI`, `JWT_SECRET`, `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `WHATSAPP_TOKEN`, `AGORA_APP_ID`, `AGORA_APP_CERTIFICATE`.

3. **Data Seeding**:
   Populate the platform with hundreds of historical records for testing:
   ```bash
   cd Swathya_Connect_Backend
   node src/seeds/historicalSeeder.js
   ```

4. **Launch**:
   - Backend: `npm run dev` (Port 8080)
   - Frontend: `npm run dev` (Port 5173)

---

## 🔑 Demo Access

| Role | Email | Password |
|---|---|---|
| **System Admin** | `admin@swasthya.com` | `demo@123` |
| **Verified Doctor** | `doctor@swasthya.com` | `demo@123` |
| **Local Pharmacy** | `pharmacy@swasthya.com` | `demo@123` |
| **Patient** | `patient@swasthya.com` | `demo@123` |

---

*Swasthya Connect is built with ❤️ for a Healthier Nepal. By merging cutting-edge tech with local needs, we are redefining what medical care looks like in the 21st century.*
