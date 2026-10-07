# 🛍️ Zedech USA — E-Commerce Platform

A modern, high-performance, full-stack E-Commerce application designed for seamless online shopping, dynamic inventory management, and smooth payment processing.

---

## 🏗️ Architecture Overview

The application follows a decoupled full-stack architecture optimized for high performance, serverless scaling, and global edge distribution:

```mermaid
graph TD
    A[Client Browser] -->|Next.js 16 + React 19| B[Frontend - Vercel Edge Host]
    B -->|REST API Requests| C[Backend API - Vercel Serverless Host]
    C -->|Authentication & Cloud Data| D[Firebase / Firestore Database]
    C -->|Payment Gateways| E[Stripe & PayPal APIs]
```

- **Frontend**: Hosted on **Vercel** (Next.js 16 App Router, React 19, Tailwind CSS v4, Framer Motion).
- **Backend**: Hosted on **Vercel** (Node.js & Express API Serverless Functions).
- **Database & Auth**: **Firebase** (Firestore Database, Firebase Auth, & Cloud Storage).
- **Payments**: Integrated with **Stripe** and **PayPal** SDKs.

---

## ✨ Features

### 🛒 E-Commerce & Customer Experience
- **Interactive Shop & Product Catalog**: Real-time category filtering, search, sorting, tag management, and stock status indicators.
- **Dynamic Cart Drawer & Checkout**: Responsive slide-out cart drawer with instant tax, discount coupon application, and live item recalculation.
- **User Authentication**: Secure sign up, log in, password reset, and user profile management powered by Firebase Auth.
- **Stripe & PayPal Checkout**: Secure multi-method checkout workflow with live client-side validation.
- **Customer Product Reviews**: Detailed rating summaries, review submissions, and media uploads.

### 🛡️ Admin & CMS Dashboard
- **Product Management**: Add, edit, delete, and list products with variations (colors, sizes, stock levels).
- **Order Management**: Monitor customer orders, update tracking numbers, and modify order fulfillment statuses.
- **Content Management (CMS)**: Manage dynamic homepage banners, promo codes, FAQs, and store announcements.

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: Next.js 16 (App Router) & React 19
- **Styling**: Tailwind CSS v4, Vanilla CSS Design System
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Form Handling & Validation**: React Hook Form & Zod
- **Deployment Platform**: Vercel

### **Backend**
- **Runtime & Framework**: Node.js & Express.js
- **Database**: Firebase / Firestore Database & Prisma ORM Engine
- **Authentication**: JWT & Firebase Authentication SDK
- **Email Notifications**: Nodemailer
- **Deployment Platform**: Vercel Serverless Functions

---

## 📁 Repository Structure

```text
zedech-usa/
├── frontend/                 # Next.js 16 Frontend Application
│   ├── src/
│   │   ├── app/              # Next.js App Router (Pages: shop, admin, profile, cart, etc.)
│   │   ├── components/       # Reusable UI Components (Navbar, Footer, CartDrawer, etc.)
│   │   ├── context/          # React Context (AuthContext, ThemeContext, CartContext)
│   │   └── lib/              # API clients & Firebase configuration helper
│   ├── public/               # Static Assets & Images
│   ├── package.json          # Frontend Dependencies & Scripts
│   └── next.config.ts        # Next.js Server & Vercel Config
│
├── backend/                  # Node.js / Express Backend Application
│   ├── src/
│   │   ├── controllers/      # Route Handlers (Auth, Products, Orders, Admin, CMS)
│   │   ├── routes/           # Express Route Definitions
│   │   ├── middleware/       # JWT Auth & Rate Limiting Middleware
│   │   └── config/           # Firebase Admin & Database Config
│   ├── package.json          # Backend Dependencies & Scripts
│   └── vercel.json           # Serverless Deployment Config for Vercel
│
└── README.md                 # Project Documentation
```

---

## ⚙️ Environment Variables Setup

### 1. Frontend (`frontend/.env.local`)
Create a `.env.local` file inside the `frontend` directory:

```env
# API Backend URL (Points to Vercel deployed backend in production)
NEXT_PUBLIC_API_BASE_URL=https://your-backend-api.vercel.app/api

# Stripe Public Key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Firebase Client SDK Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 2. Backend (`backend/.env`)
Create a `.env` file inside the `backend` directory:

```env
PORT=5000
NODE_ENV=production

# Firebase Admin Credentials / Database Config
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your_project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Stripe Payment Secret
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
PAYPAL_CLIENT_ID=your_paypal_client_id
```

---

## 🚀 Getting Started Locally

### Prerequisites
- **Node.js**: v18.x or higher
- **npm** or **yarn** / **pnpm**
- **Vercel CLI** *(optional, for local serverless testing)*

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/zedech-usa.git
   cd zedech-usa
   ```

2. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   The frontend will start at `http://localhost:3000`.

3. **Setup Backend**
   ```bash
   cd ../backend
   npm install
   npm run dev
   ```
   The API backend will start at `http://localhost:5000`.

---

## 🌐 Deploying to Vercel

### Deploying Frontend to Vercel
1. Push your code to GitHub/GitLab.
2. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New Project**.
3. Select the `zedech-usa` repository and choose `frontend` as the **Root Directory**.
4. Framework Preset: **Next.js**.
5. Add all Environment Variables specified in `frontend/.env.local`.
6. Click **Deploy**.

### Deploying Backend to Vercel
1. In Vercel, click **Add New Project** again.
2. Select the `zedech-usa` repository and choose `backend` as the **Root Directory**.
3. Ensure `backend/vercel.json` exists with the serverless configuration:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "src/app.ts",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "src/app.ts"
       }
     ]
   }
   ```
4. Add all Environment Variables specified in `backend/.env`.
5. Click **Deploy**.

---

## 📡 Essential API Routes

| Endpoint | Method | Description | Access |
| :--- | :--- | :--- | :--- |
| `/api/auth/register` | `POST` | User account registration | Public |
| `/api/auth/login` | `POST` | User login & JWT issuance | Public |
| `/api/products` | `GET` | Get all products with filters & pagination | Public |
| `/api/products/:id` | `GET` | Get product details by ID/Slug | Public |
| `/api/orders` | `POST` | Create new order & initialize payment intent | Authenticated |
| `/api/admin/products` | `POST/PUT/DELETE` | Manage products catalog | Admin Only |
| `/api/admin/orders` | `GET/PATCH` | Manage store orders & fulfillment | Admin Only |

---

## 📄 License & Credits

This project is maintained by **Zedech Team**. All rights reserved.
