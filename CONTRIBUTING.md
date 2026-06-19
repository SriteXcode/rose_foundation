# Contributing to Black Rose Foundation

Thank you for your interest in contributing to the Black Rose Foundation NGO Management application! We welcome contributions of all kinds, including bug fixes, feature requests, documentation improvements, and feedback.

By contributing to this project, you agree to abide by our [Code of Conduct](./CODE_OF_CONDUCT.md).

---

## 🚀 How Can I Contribute?

### 1. Reporting Bugs
*   Check the existing issues to see if the bug has already been reported.
*   If not, open a new issue. Include a clear title, a detailed description, steps to reproduce the bug, expected behavior, and screenshots or logs if applicable.

### 2. Suggesting Enhancements
*   Check existing issues to ensure the feature hasn't been proposed.
*   Open an issue describing the proposed enhancement, why it would be useful, and how it might work.

### 3. Submitting Pull Requests (PR)
*   Fork the repository and create your branch from `master`.
*   Ensure that you install the dependencies using:
    ```bash
    npm run install:all
    ```
*   Make your changes, keeping style guidelines in mind.
*   Test your changes locally. Run the development server using:
    ```bash
    npm run dev
    ```
*   Commit your changes with clear, descriptive commit messages.
*   Push to your fork and submit a Pull Request to the main branch.

---

## 💻 Development Guidelines

### Code Style & Guidelines
*   **React Component Structure**:
    *   Place reusable UI components in [`client/src/components/`](./client/src/components).
    *   Place main views/routes in [`client/src/pages/`](./client/src/pages).
    *   Use functional components with hooks.
*   **CSS & Styling**:
    *   Use Tailwind CSS classes for UI styling.
    *   Keep layouts responsive and follow the design guidelines.
*   **API & Backend**:
    *   Add schema definitions in [`backend/models/`](./backend/models).
    *   Create routes in [`backend/routes/`](./backend/routes) and associate controllers in [`backend/controllers/`](./backend/controllers).
    *   Write clean, async-await code, handling errors with appropriate try-catch blocks and Express error handlers.

### Commit Messages
We follow general git commit conventions. Keep messages descriptive:
*   `feat: add tax exemption certificate generator`
*   `fix: resolve donation checkout modal routing bug`
*   `docs: update readme with live deployment instructions`

---

## 🐞 Security Vulnerabilities
If you discover a security vulnerability within this project, please do **not** open a public issue. Instead, please follow the steps outlined in our [Security Policy](./SECURITY.md).
