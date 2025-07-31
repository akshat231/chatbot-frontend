# ✨ Next.js Chatbot Frontend

This is the **frontend** of a full-stack web application built with **Next.js** and **TypeScript**. It enables users to **sign up, log in**, **create and manage content**, and **search existing content** via a clean, responsive UI.

> 🔐 Authenticated features, optimized performance, and a smooth developer experience.

---

## 🛠️ Tech Stack

- [Next.js](https://nextjs.org/) (App Router)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [React Hook Form](https://react-hook-form.com/) for form handling
- [Zod](https://zod.dev/) for schema validation
- [Axios](https://axios-http.com/) for API requests
- Optional: [NextAuth.js](https://next-auth.js.org/) for auth or custom JWT/session-based auth

---

## 🚀 Features

✅ User Authentication  
✅ Sign up / Log in / Log out  
✅ Add new content  
✅ View your content  
✅ Search content  
✅ Protected routes  
✅ Responsive UI

---

## 📦 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/your-username/nextjs-content-app-frontend.git
cd nextjs-content-app-frontend
```
### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Set up environment variables
Create a .env.local file in the root and add:
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
# Add NEXTAUTH_URL or JWT secret if using NextAuth or similar
```

### 4. Run the development server

```bash
npm run dev
```

## 🔐 Authentication Flow

Uses JWT

Auth token stored in localStorage

Protected pages redirect to login if not authenticated

## 🤝 Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License
MIT


## 📬 Contact
For issues, suggestions, or questions, feel free to contact akshatsharmasde@gmail.com
