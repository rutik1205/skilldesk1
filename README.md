# SkillDesk — Freelance Developer Marketplace (INR ₹ & ImageKit CDN)

> A modern, light-themed MERN stack freelancing platform built for software projects delivered as **verified GitHub repositories**, with pricing in **Indian Rupees (₹ / INR)** and media uploads powered by **ImageKit CDN**.

---

## 🌟 Key Features

### 1. 💼 Client Features
- **Post Projects in INR (₹)**: Define project title, category, budget (₹ INR with quick chips like ₹10,000, ₹25,000, ₹50,000, ₹1,00,000), deadline, required skills, detailed description, and architecture attachments via **ImageKit CDN**.
- **Evaluate Proposals**: Inspect developer proposals with bid amounts in INR, delivery timelines, technical pitches, and GitHub portfolios.
- **Hire & Award**: Choose a freelancer with 1 click. Project moves to `In Progress`.
- **Review GitHub Deliverable**: Inspect the submitted **GitHub Repository URL** and live demo.
- **Approve & Rate**: Approve the GitHub code and leave a 1–5 star rating with feedback.

### 2. 💻 Freelancer Features
- **Browse Open Projects**: Filter by category, INR budget, status, or search keywords.
- **Role-Aware UI**: Freelancers see a dedicated developer view (*Find Projects*, *My Dashboard*, *My Proposals*) without client-only controls like "Post a Project".
- **Submit Competitive Bids**: Bid in INR (₹), specify delivery days, technical pitch, GitHub portfolio link, and attach resumes or files via ImageKit.
- **Deliver via GitHub**: When awarded a job, submit the deliverable as a **GitHub repository link** (`https://github.com/...`) with live demo and release notes.
- **Earnings & Reviews**: Build a verified developer reputation and track completed project earnings.

### 3. 🖼️ ImageKit CDN
- Profile avatar upload and live preview.
- Project specification documents, diagrams, and mockup uploads.
- Official ImageKit Node.js SDK integration.

---

## 🚀 Running the Application

Both servers are active:

- **Frontend Client**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

### Start Commands

```bash
# Backend
cd server
npm run dev

# Frontend
cd client
npm run dev
```

---

## 🔐 Authentication & Roles
- Register directly as a **Client** (to hire and post projects) or as a **Freelancer** (to browse and bid).
- You can switch roles anytime in your **Profile & Settings** modal.
