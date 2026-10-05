# 🛒 Zedech Store – Modern E-Commerce Web Platform

![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

**Zedech Store** is a full-featured, high-performance e-commerce web application engineered with **React.js**, **Tailwind CSS**, and **Firebase**. It provides users with a seamless online shopping experience, featuring real-time product search, dynamic filtering, persistent shopping cart management, secure user authentication, and an instant checkout workflow.

---

## ✨ Key Features

- **🛍️ Dynamic Product Catalog**: Browse products organized by categories with instant search and multi-criteria filtering.
- **🛒 Interactive Shopping Cart**: Add, remove, and adjust item quantities with real-time total price calculation and persistent state.
- **🔐 User Authentication**: Secure user registration and login using Firebase Authentication.
- **⚡ Real-time Database Sync**: Powered by Firebase Cloud Firestore for instant inventory updates and order tracking.
- **📱 Mobile-First Responsive Design**: Optimized UI layouts crafted with Tailwind CSS for perfect rendering on mobile, tablet, and desktop screens.
- **🚀 Fast Performance**: Client-side routing with React Router and optimized asset delivery for smooth page transitions.

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology | Usage |
| :--- | :--- | :--- |
| **Frontend Framework** | `React.js` | Modular component architecture & state management |
| **Styling** | `Tailwind CSS` | Modern responsive layout, grid systems, and animations |
| **State Management** | `React Context API / Redux` | Global shopping cart and user session state |
| **Backend & Database** | `Firebase Cloud Firestore` | NoSQL database for product inventory & order records |
| **Auth Service** | `Firebase Authentication` | Secure user sign-in and account management |
| **Routing** | `React Router DOM v6` | Seamless single-page app (SPA) client-side navigation |

---

## 📂 Project Structure

```text
zedech-store/
├── public/
│   ├── favicon.ico
│   └── index.html
├── src/
│   ├── assets/          # Product images, icons, and static graphics
│   ├── components/      # Reusable UI components (Navbar, Footer, ProductCard, CartDrawer)
│   ├── context/         # React Context for Shopping Cart & Auth State
│   ├── pages/           # Page views (Home, Shop, ProductDetail, Cart, Checkout, Login)
│   ├── firebase/        # Firebase configuration and Firestore helper functions
│   ├── styles/          # Tailwind custom utilities and global styles
│   ├── App.js           # Main application routes setup
│   └── index.js         # Entry point
├── .env.example         # Environment variables template
├── tailwind.config.js   # Tailwind CSS setup
├── package.json         # Project dependencies and npm scripts
└── README.md            # Documentation
