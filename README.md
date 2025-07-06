<!-- Brain Icon SVG as Logo -->
<p align="center">
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/brain.svg" alt="Doutly Brain Logo" width="80" height="80" />
</p>

<h1 align="center">🧠 Doutly - Education Platform</h1>

<p align="center">
  <b>India's #1 Corporate-Grade Platform for Online Tutoring, Tech Mentorship, Events, and Careers</b><br/>
  <a href="https://doutly.com" target="_blank">🌐 View Live Demo</a>
</p>

---

## 🚀 Overview
Doutly is a next-generation education platform connecting students, tutors, freelancers, and institutions for instant doubt solving, project guidance, live events, and career opportunities. Built for scale, security, and seamless user experience, Doutly empowers learning and teaching at every level.

---

## 🧩 Key Features
- **Role-Based Authentication & Authorization** (Admin, Student, Tutor, Manager, etc.)
- **Real-Time Firestore Integration** for events, jobs, and user data
- **Admin Dashboard** for managing users, job postings, settings, and email templates
- **Live Events & Hackathons** with dynamic data
- **Careers Portal** with live job postings
- **Input Sanitization & Security** throughout all forms
- **SEO Optimized** with meta tags and Open Graph support
- **Responsive, Modern UI** with Tailwind CSS & Lucide Icons
- **Email Template Management** for admins
- **Protected Routes** and error handling

---

## 🛠️ Tech Stack
- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Backend/DB:** Firebase Auth, Firestore
- **Icons:** Lucide React
- **SEO:** react-helmet-async

---

## ⚡ Quick Start

1. **Clone the repo:**
   ```sh
   git clone https://github.com/your-org/doutly-platform.git
   cd doutly-platform
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Configure Firebase:**
   - Copy your Firebase config to `src/lib/firebase.ts`.
   - Set up Firestore rules and Auth providers as needed.
4. **Run the app:**
   ```sh
   npm run dev
   ```
5. **Visit:** [http://localhost:5173](http://localhost:5173) or [doutly.com](https://doutly.com)

---

## 🌐 Demo
- **Live:** [https://doutly.com](https://doutly.com)

---

## 🤝 Contribution
We welcome contributions! Please fork the repo, create a feature branch, and submit a pull request. For major changes, open an issue first to discuss your ideas.

---

## 🧑‍💻 Developer
**T.G. Manikanta**

---

## 📄 License
This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

<p align="center">
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/brain.svg" alt="Doutly Brain Logo" width="40" height="40" />
  <br/>
  <b>Doutly - Empowering Education, Instantly.</b>
</p>

---

## **How to Fix**

### 1. **Install Terser as a Dev Dependency**

Run this command in your project root:

```sh
npm install --save-dev terser
```

Or, if you use Yarn:

```sh
yarn add --dev terser
```

---

### 2. **Re-run the Build**

After installing, try:

```sh
npm run build
```

If it works locally, push your changes and Netlify will pick up the fix on the next deploy.

---

## **Why This Happens**

- Some Vite plugins or your Vite config may explicitly request Terser for minification.
- Vite no longer bundles Terser by default, so you must install it yourself if you want to use it.

---

## **Summary**

- **Install Terser:** `npm install --save-dev terser`
- **Rebuild locally and on Netlify**

This should resolve your build error. If you see any new errors, please share the full message for further help!
