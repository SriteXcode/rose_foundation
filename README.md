# Black Rose Foundation

🌐 **Live Production Link**: [https://www.blackrosefoundation.org.in](https://www.blackrosefoundation.org.in/)

A comprehensive NGO Management System built on the MERN stack (MongoDB, Express, React, Node.js). This platform automates administration tasks, facilitates volunteer onboarding, manages public blogs/gallery updates, and processes donations securely with automated tax invoice/certificate generation.

---

## 📂 Project Structure

This project is structured as a monorepo containing both the frontend client and the backend server:

*   **[`backend/`](./backend)**: Express.js server providing REST APIs, Mongoose models, and integration with payment gateways, email delivery, and cloud media hosting.
*   **[`client/`](./client)**: Vite-powered React single page application styled with Tailwind CSS, supporting interactive donor forms, volunteer modules, and a comprehensive admin control panel.

---

## ⚡ Key Features

### 🌐 Public Portal
*   **Hero & About Sections**: Dynamic presentation of the NGO's mission, vision, and core team members.
*   **Project Showcases**: Visually rich grids highlighting past and present community works.
*   **Interactive Gallery & Blogs**: Read-only access to community outreach articles and gallery media.
*   **Contact & Newsletter Forms**: Easy-to-use communication interfaces for query submission and newsletter registration.

### 💳 Donation & Finance
*   **Razorpay Integration**: End-to-end secure transaction processing for single donations.
*   **Automated Receipt Generation**: Dynamic generation of PDF invoices and Section 80G tax-exemption certificates upon successful payments.
*   **Post-Donation Modals**: Interactive confirmation workflows enhancing user engagement.

### 🤝 Volunteers & Onboarding
*   **Join Us Workflows**: Structured online applications for memberships and volunteer opportunities.
*   **User Profiles**: Self-service accounts for volunteers to view certificate records and personal details.

### 🛡️ Admin Control Panel
*   **Content Management (CMS)**: Add, edit, or delete blogs, projects, gallery assets, and team profiles.
*   **Financial Tracking**: Overview of all donations, payment statuses, and donor contacts.
*   **Communication Center**: Manage volunteer lists, incoming queries, and dispatch newsletters directly to subscribed users.
*   **Platform Settings**: Modify core NGO credentials, contact metadata, and legal documentation templates.

---

## 🛠️ Technology Stack

### Frontend
*   **React (v19)**: Component-driven UI development.
*   **Vite**: Extremely fast bundler and dev server.
*   **Tailwind CSS (v4)**: Modern, utility-first utility class styling.
*   **Framer Motion**: Smooth micro-animations and route transitions.
*   **React Router DOM (v7)**: Client-side routing.
*   **Libraries**: `jspdf` & `html2canvas` (PDF invoices), `react-hot-toast` (alerts), `react-quill-new` (rich-text blog editing).

### Backend
*   **Node.js & Express**: High-performance asynchronous REST API architecture.
*   **MongoDB & Mongoose**: Flexible document schemas and ODM.
*   **Nodemailer**: Automated transaction emails and newsletter dispatches.
*   **Cloudinary**: Remote storage and hosting for image/PDF uploads.
*   **Security Tools**: `helmet` (HTTP headers security), `express-rate-limit` (anti-DOS rate limiting), `bcryptjs` (password hashing), and `jsonwebtoken` (JWT admin authorization).

---

## 🚀 Getting Started

### 📋 Prerequisites
Make sure you have the following installed on your machine:
*   [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
*   [MongoDB](https://www.mongodb.com/) (running instance locally or via Atlas)

---

### ⚙️ Setup & Installation

#### 1. Clone the repository and navigate to root:
```bash
git clone https://github.com/your-username/rose_foundation.git
cd rose_foundation
```

#### 2. Configure Environment Variables
You must configure variables for both the client and backend. Use the provided template files to create `.env` files:

*   **Backend config**: Copy `backend/.env.example` to `backend/.env` and update the database strings, email credentials, Razorpay key pairs, and Cloudinary secrets.
    ```bash
    cp backend/.env.example backend/.env
    ```
*   **Client config**: Copy `client/.env.example` to `client/.env` and verify the `VITE_API_URL` variable.
    ```bash
    cp client/.env.example client/.env
    ```

#### 3. Install Dependencies
You can install dependencies for both the frontend and backend simultaneously using the root orchestration script:
```bash
npm run install:all
```
This runs `npm install` in both the `client/` and `backend/` directories.

---

### 🏃 Running Locally

To run both backend and client servers concurrently in development mode, run:
```bash
npm run dev
```

*   **Frontend Client**: Runs on [http://localhost:5173](http://localhost:5173)
*   **Backend Server**: Runs on [http://localhost:5000](http://localhost:5000)

Alternatively, you can run services individually:
*   **Backend only**: `npm run dev:backend`
*   **Client only**: `npm run dev:client`

---

## 📜 Scripts Reference

The root [`package.json`](./package.json) orchestrates the following workflows:

| Script | Command | Purpose |
| :--- | :--- | :--- |
| `install:all` | `npm install --prefix backend && npm install --prefix client` | Installs dependencies for both client and server projects. |
| `dev` | `concurrently "npm run dev --prefix backend" "npm run dev --prefix client"` | Spawns nodemon server and vite dev client concurrently. |
| `dev:backend` | `npm run dev --prefix backend` | Runs the backend server using nodemon for automatic reloads. |
| `dev:client` | `npm run dev --prefix client` | Runs the Vite development server for the frontend. |
| `build:client`| `npm run build --prefix client` | Builds optimized production assets for the frontend. |
| `start:backend`| `npm start --prefix backend` | Starts the production Node.js backend. |

---

## ⚖️ License & Community Files

*   **License**: This project is licensed under the MIT License. See the [`LICENSE`](./LICENSE) file for details.
*   **Community Guidelines**:
    *   [Code of Conduct](./CODE_OF_CONDUCT.md)
    *   [Contributing Guidelines](./CONTRIBUTING.md)
    *   [Security Policy](./SECURITY.md)

