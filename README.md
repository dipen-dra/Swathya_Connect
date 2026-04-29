# 🏥 Swasthya Connect — Telemedicine Platform

> **Nepal's premier digital healthcare platform** connecting patients with certified doctors and pharmacies through real-time video, audio, and chat consultations, integrated payments, medicine orders, and AI-powered reminders.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Features by Role](#features-by-role)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Demo Credentials](#demo-credentials)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Payment Integration](#payment-integration)
- [Real-time Features](#real-time-features)
- [Third-party Integrations](#third-party-integrations)

---

## Overview

Swasthya Connect is a full-stack **MERN** telemedicine application built for Nepal's healthcare ecosystem. It enables patients to book video, audio, or chat consultations with verified doctors, order medicines from pharmacies, manage prescriptions, and receive automated medicine reminders via email and WhatsApp.

### Key Highlights

| Feature | Detail |
|---|---|
| 🩺 Consultation Types | Video (Agora RTC), Audio, Chat |
| 💳 Payments | eSewa & Khalti (Nepal gateways) |
| 💬 Real-time Messaging | Socket.IO |
| 💊 Medicine Orders | Prescription-based ordering |
| 🔔 Reminders | Email (Nodemailer) + WhatsApp Cloud API |
| 🔐 Auth | JWT + Google OAuth 2.0 |
| 👥 Roles | Patient, Doctor, Pharmacy, Admin |

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19.2.0 | UI Framework |
| Vite | 7.2.4 | Build Tool |
| React Router DOM | 7.9.6 | Routing |
| Tailwind CSS | 4.1.17 | Styling |
| Radix UI | Various | Headless UI Components |
| Socket.IO Client | 4.8.1 | Real-time Communication |
| Agora RTC | 4.24.2 | Video/Audio Calls |
| Khalti Checkout | 2.2.0 | Payment Gateway |
| Axios | 1.13.2 | HTTP Client |
| Recharts | 3.5.1 | Analytics Charts |
| Sonner | 2.0.7 | Toast Notifications |
| Lucide React | 0.555.0 | Icons |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | 24.x | Runtime |
| Express | 4.18.2 | Web Framework |
| MongoDB + Mongoose | 8.0.3 | Database |
| Socket.IO | 4.8.1 | WebSocket Server |
| JWT | 9.0.2 | Authentication |
| Bcryptjs | 2.4.3 | Password Hashing |
| Nodemailer | 7.0.11 | Email Service |
| Multer | 1.4.5 | File Uploads |
| PDFKit | 0.17.2 | PDF Generation |
| Node-cron | 4.2.1 | Scheduled Jobs |
| Agora Access Token | 2.0.4 | Video Token Generation |
| Google Auth Library | 10.5.0 | OAuth Verification |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (React + Vite)                │
│   Patient  │  Doctor  │  Pharmacy  │  Admin Dashboard       │
│                    Port: 5173                               │
└──────────────────────┬──────────────────────────────────────┘
                       │  HTTP REST + Socket.IO
┌──────────────────────▼──────────────────────────────────────┐
│                  EXPRESS SERVER  (Port: 8080)               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐  │
│  │Auth/JWT  │ │REST APIs │ │Socket.IO │ │Cron Schedulers│  │
│  └──────────┘ └──────────┘ └──────────┘ └───────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
   ┌─────────┐  ┌────────────┐  ┌──────────────┐
   │ MongoDB │  │ Agora RTC  │  │ WhatsApp API │
   │  (DB)   │  │ (Video)    │  │  + Nodemailer│
   └─────────┘  └────────────┘  └──────────────┘
        │
   ┌────┴─────────────────────────┐
   │  eSewa  │  Khalti  │ Uploads │
   └──────────────────────────────┘
```

---

## Features by Role

### 👤 Patient
- Register / Login (Email + Google OAuth)
- Browse & filter verified doctors by specialty
- Book consultations (Video / Audio / Chat)
- Pay via **eSewa** or **Khalti**
- Join real-time video/audio/chat consultation room
- View & download digital prescriptions (PDF)
- Order medicines from pharmacies
- Set medicine reminders (Email + WhatsApp)
- View transaction history with invoice PDFs
- Rate & review doctors post-consultation
- Manage account settings & notification preferences

### 🩺 Doctor
- Full profile setup (specialty, fee, availability)
- Upload verification documents for admin approval
- View & manage incoming consultation requests
- Approve or reject consultations with reasons
- Conduct video/audio/chat consultations
- Write & issue digital prescriptions
- View earnings & consultation history
- Manage medical documents

### 💊 Pharmacy
- Full pharmacy profile setup
- Upload verification documents
- Manage product inventory (add/edit/delete)
- Manage product categories with images
- Receive & process medicine orders
- Verify prescriptions uploaded by patients
- Real-time chat with patients
- Order status management (pending → processing → delivered)

### 🔴 Admin
- View verification statistics dashboard
- Approve / Reject pending doctor & pharmacy profiles
- View all registered users with role filtering
- Platform-wide analytics

---

## Project Structure

```
swasthya/
├── Swathya_Connect/              # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── landing/          # Home page sections
│   │   │   ├── layout/           # Navbar, Header, Footer
│   │   │   ├── admin/            # Admin components
│   │   │   ├── dashboard/        # Doctor dashboard components
│   │   │   ├── patient/          # Patient-specific components
│   │   │   ├── pharmacy/         # Pharmacy components
│   │   │   ├── store/            # E-commerce store components
│   │   │   ├── ui/               # Reusable UI primitives (shadcn)
│   │   │   ├── AudioConsultationDialog.jsx
│   │   │   ├── VideoConsultationDialog.jsx
│   │   │   └── ChatConsultationDialog.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── PatientDashboard.jsx
│   │   │   ├── DoctorDashboard.jsx
│   │   │   ├── PharmacyDashboard.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── ChatConsultation.jsx
│   │   │   ├── DoctorProfilePage.jsx
│   │   │   ├── PharmacyProfile.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── AccountSettings.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── VerifyOTP.jsx
│   │   │   ├── ResetPassword.jsx
│   │   │   ├── public/
│   │   │   │   ├── Store.jsx
│   │   │   │   └── CartPage.jsx
│   │   │   └── patient/
│   │   │       └── CheckoutPage.jsx
│   │   ├── contexts/
│   │   │   ├── AuthContext.jsx
│   │   │   └── SocketContext.jsx
│   │   └── services/
│   │       ├── api.js
│   │       └── consultationSocket.js
│   ├── .env
│   ├── vite.config.js
│   └── package.json
│
└── Swathya_Connect_Backend/      # Backend (Node.js + Express)
    ├── src/
    │   ├── config/
    │   │   └── db.js
    │   ├── controllers/
    │   ├── middleware/
    │   ├── models/
    │   │   ├── User.js
    │   │   ├── Profile.js
    │   │   ├── Doctor.js
    │   │   ├── Pharmacy.js
    │   │   ├── Consultation.js
    │   │   ├── ConsultationMessage.js
    │   │   ├── Prescription.js
    │   │   ├── MedicineOrder.js
    │   │   ├── MedicineReminder.js
    │   │   ├── Inventory.js
    │   │   ├── Category.js
    │   │   ├── Order.js
    │   │   ├── Chat.js
    │   │   ├── Message.js
    │   │   ├── DoctorDocument.js
    │   │   └── PromoCode.js
    │   ├── routes/
    │   ├── utils/
    │   │   ├── reminderScheduler.js
    │   │   ├── consultationExpiryChecker.js
    │   │   └── whatsappService.js
    │   ├── seeds/
    │   │   └── seedData.js
    │   ├── server.js
    │   └── socket.js
    ├── uploads/
    ├── .env
    └── package.json
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone & Install

```bash
# Install backend dependencies
cd Swathya_Connect_Backend
npm install

# Install frontend dependencies
cd ../Swathya_Connect
npm install
```

### 2. Configure Environment Variables

Copy and fill in the `.env` files as described in the [Environment Variables](#environment-variables) section below.

### 3. Seed Demo Data

```bash
cd Swathya_Connect_Backend
node src/seeds/seedData.js
```

### 4. Start the Servers

```bash
# Terminal 1 — Backend
cd Swathya_Connect_Backend
npm run dev
# Runs on http://localhost:8080

# Terminal 2 — Frontend
cd Swathya_Connect
npm run dev
# Runs on http://localhost:5173
```

---

## Environment Variables

### Backend — `Swathya_Connect_Backend/.env`

```env
# Server
NODE_ENV=development
PORT=8080

# Database
MONGO_URI=mongodb://localhost:27017/swasthya_connect

# Auth
JWT_SECRET=your_jwt_secret_key_here

# Email (Gmail App Password)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_char_app_password

# WhatsApp Cloud API
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_whatsapp_token

# Agora (Video/Audio Calls)
AGORA_APP_ID=your_agora_app_id
AGORA_APP_CERTIFICATE=your_agora_certificate

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
```

### Frontend — `Swathya_Connect/.env`

```env
VITE_AGORA_APP_ID=your_agora_app_id
```

> **Gmail App Password**: Go to Google Account → Security → 2-Step Verification → App Passwords → Generate new.

---

## Demo Credentials

> All demo accounts use the same password: **`demo@123`**

| Role | Email | Password | Access |
|---|---|---|---|
| 🔴 **Admin** | `admin@swasthya.com` | `demo@123` | Admin Dashboard — verify/reject doctors & pharmacies, view all users |
| 🩺 **Doctor** | `doctor@swasthya.com` | `demo@123` | Doctor Dashboard — manage consultations, write prescriptions |
| 💊 **Pharmacy** | `pharmacy@swasthya.com` | `demo@123` | Pharmacy Dashboard — inventory, orders, patient chat |
| 👤 **Patient** | `patient@swasthya.com` | `demo@123` | Patient Dashboard — book consultations, order medicines |

> **Note**: To re-run the seed script at any time:
> ```bash
> cd Swathya_Connect_Backend
> node src/seeds/seedData.js
> ```

---

## API Reference

### Auth Routes — `/api/auth`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/register` | Register new user (multipart/form-data) | Public |
| POST | `/login` | Login with email & password | Public |
| POST | `/logout` | Logout | Protected |
| POST | `/google` | Google OAuth login/register | Public |
| POST | `/forgot-password` | Send OTP to email | Public |
| POST | `/verify-otp` | Verify OTP | Public |
| POST | `/reset-password` | Reset password with OTP | Public |
| GET | `/settings` | Get notification settings | Protected |
| PUT | `/settings/notifications` | Update notification preferences | Protected |
| PUT | `/change-password` | Change password | Protected |
| POST | `/account/deactivate` | Deactivate account | Protected |
| DELETE | `/account` | Delete account | Protected |

### Consultations — `/api/consultations`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Get user's consultations |
| POST | `/` | Book a new consultation |
| PUT | `/:id` | Update consultation |
| PUT | `/:id/cancel` | Cancel consultation |
| PUT | `/:id/rate` | Rate consultation |
| POST | `/:id/re-request` | Re-request cancelled consultation |

### Doctors — `/api/doctors`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | List all verified doctors |
| GET | `/:id` | Get doctor by ID |
| GET | `/consultation-requests` | Get pending requests (Doctor only) |
| PUT | `/consultations/:id/status` | Approve/reject consultation |
| GET | `/earnings` | Get earnings summary |

### Pharmacy — `/api/pharmacies`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | List all verified pharmacies |
| GET | `/dashboard/inventory` | Get inventory (Pharmacy only) |
| POST | `/dashboard/inventory` | Add inventory item |
| PUT | `/dashboard/inventory/:id` | Update item |
| DELETE | `/dashboard/inventory/:id` | Delete item |

### Medicine Orders — `/api/medicine-orders`
| Method | Endpoint | Description |
|---|---|---|
| POST | `/` | Create medicine order |
| GET | `/` | Get patient orders |
| GET | `/pharmacy` | Get pharmacy orders |
| PUT | `/:id/status` | Update order status |
| PUT | `/:id/verify` | Verify prescription |
| PUT | `/:id/cancel` | Cancel order |

### Payment — `/api/payment`
| Method | Endpoint | Description |
|---|---|---|
| POST | `/esewa/initiate` | Initiate eSewa payment |
| GET | `/esewa/verify` | Verify eSewa payment |
| POST | `/khalti/initiate` | Initiate Khalti payment |
| POST | `/khalti/verify` | Verify Khalti payment |
| POST | `/esewa/initiate-medicine` | eSewa for medicine order |
| POST | `/khalti/verify-medicine` | Khalti for medicine order |

### Admin — `/api/admin`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/stats` | Verification statistics |
| GET | `/pending-profiles` | Pending verifications |
| GET | `/approved-profiles` | Approved profiles |
| PUT | `/approve/:profileId` | Approve a profile |
| PUT | `/reject/:profileId` | Reject a profile |
| GET | `/users` | All registered users |
| GET | `/analytics` | Platform analytics |

---

## Database Schema

### User
```
fullName, email (unique), phone, password (bcrypt),
role: [patient|doctor|pharmacy|admin],
isVerified, isActive, notificationPreferences,
verificationDocument, resetPasswordOTP, resetPasswordOTPExpire
```

### Profile
```
userId (ref: User), bio, address, profileImage,
specialty (doctor), fee (doctor), experience (doctor),
pharmacyName, licenseNumber, openingHours (pharmacy)
```

### Consultation
```
patientId, doctorId, doctorName, specialty,
date, time, type: [video|audio|chat],
status: [upcoming|approved|completed|cancelled|rejected],
fee, reason, notes, prescription, rating,
paymentStatus: [pending|paid|failed|refunded],
paymentMethod: [Khalti|eSewa|Cash],
patientJoined, doctorJoined, expiryStage
```

### MedicineOrder
```
patientId, pharmacyId, items[], totalAmount,
prescriptionImage, status, paymentMethod,
deliveryAddress, pharmacyNotes
```

### MedicineReminder
```
userId, medicineName, dosage, frequency,
times[], startDate, endDate,
isActive, channels: [email|whatsapp]
```

---

## Payment Integration

### eSewa (Nepal)
- Uses eSewa **v2 API** (RC environment for testing)
- Redirect-based flow: patient is redirected to eSewa checkout
- On return, server verifies payment via eSewa API
- Supports both consultation booking and medicine orders

### Khalti
- Uses Khalti **Web Checkout**
- Popup-based payment flow
- Token verification via Khalti backend API
- Supports both consultation booking and medicine orders

---

## Real-time Features (Socket.IO)

### Events

| Event | Direction | Description |
|---|---|---|
| `chat:join` | Client → Server | Join a chat room |
| `message:send` | Client → Server | Send a message |
| `message:received` | Server → Client | New message delivered |
| `user:typing` | Broadcast | Typing indicator |
| `user:stoppedTyping` | Broadcast | Stop typing indicator |
| `messages:read` | Server → Client | Messages marked read |
| `consultation:join` | Client → Server | Join consultation room |
| `consultation:signal` | Peer-to-peer | WebRTC signaling |

---

## Third-party Integrations

| Service | Purpose | Configuration |
|---|---|---|
| **Agora RTC** | Video & Audio Consultations | `AGORA_APP_ID` + `AGORA_APP_CERTIFICATE` |
| **Google OAuth 2.0** | Social Login / Register | `GOOGLE_CLIENT_ID` |
| **WhatsApp Cloud API** | Medicine Reminders | `WHATSAPP_PHONE_NUMBER_ID` + token |
| **Nodemailer (Gmail)** | OTP Emails, Reminders | `EMAIL_USER` + `EMAIL_PASS` (App Password) |
| **eSewa** | Nepali Payment Gateway | RC test environment |
| **Khalti** | Nepali Payment Gateway | Test credentials |

---

## Automated Background Jobs

| Job | Schedule | Description |
|---|---|---|
| Medicine Reminder Scheduler | Every 1 minute | Sends due reminders via email/WhatsApp |
| Consultation Expiry Checker | Every 5 minutes | Marks expired consultations automatically |

---

## Security

- Passwords hashed with **bcryptjs** (salt rounds: 10)
- Auth via **JWT** Bearer tokens stored in `localStorage`
- Protected routes verified via `middleware/auth.js`
- OTP for password reset is **SHA-256 hashed** in DB with 10-min expiry
- File uploads restricted by MIME type via **Multer**
- CORS restricted to `localhost:5173` and `localhost:5174`

---

## Running in Production

```bash
# Backend
npm start   # Runs node src/server.js

# Frontend
npm run build   # Creates dist/ folder
npm run preview # Preview the build locally
```

---

*Built with ❤️ for Nepal's healthcare ecosystem.*
