# 💰 MoneyMentor: Your AI-Powered Financial Strategist

<p align="center">
  <img src="https://via.placeholder.com/800x200?text=MoneyMentor+Header+Image" alt="MoneyMentor Banner" width="800">
</p>

**MoneyMentor** is a comprehensive, full-stack financial management platform designed to help users track their wealth, analyze their portfolio, and get personalized financial advice through a state-of-the-art AI Mentor. It combines the power of **React**, **Node.js**, and **Google Gemini AI** with a secure **MySQL** backend.

---

## 🌟 Key Features

- **📊 Dynamic Dashboard**: A 360-degree view of your net worth, assets, and monthly cash flow.
- **🤖 AI Money Mentor**: An intelligent chatbot that provides real-time financial guidance, expense optimization tips, and investment strategies.
- **🛡️ Smart Fallback Logic**: Proprietary heuristic engine remains active even if external AI services are unreachable, providing advice based on your profile data.
- **📈 Portfolio X-Ray**: Detailed tracking of holdings, sector allocation, and tax estimations (STCG/LTCG).
- **📝 Comprehensive Profile**: A secure center to manage your income, expenses, risk appetite, and financial goals.
- **🧮 Tax & Planning Tools**: Tools to calculate tax liabilities and plan for long-term goals like FIRE (Financial Independence, Retire Early).

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: React.js
- **Styling**: Tailwind CSS / Custom CSS
- **Charts**: Recharts / Chart.js
- **State Management**: React Context API

### **Backend**
- **Runtime**: Node.js
- **Framework**: Express.js
- **Authentication**: JWT (JSON Web Tokens) with Bcrypt password hashing
- **AI Engine**: Google Generative AI (Gemini 1.5 Flash)

### **Database**
- **System**: MySQL (Local Instance)
- **Schema**: `money_mentor_localhost`

---

## 🚀 Getting Started

### **Prerequisites**
- [Node.js](https://nodejs.org/) (v16.x or later)
- [MySQL Server](https://www.mysql.com/downloads/)
- [Google AI Studio API Key](https://aistudio.google.com/)

### **1. Clone & Configuration**
Create a `.env` file in the `backend/` directory with the following variables:
```env
PORT=5000
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/money_mentor_localhost"
GEMINI_API_KEY="YOUR_API_KEY_HERE"
JWT_SECRET="YOUR_RANDOM_SECRET"
```

### **2. Database Setup**
Initialize the required tables by running:
```bash
cd backend
node setup_db.js
```

### **3. Run Backend**
```bash
cd backend
npm install
npm start
```

### **4. Run Frontend**
```bash
cd frontend
npm install
npm run dev
```

---

## 🔒 Security & Architecture
- **JWT Authorization**: Routes are protected using secure token-based authentication.
- **Data Persistence**: All user profiles, transactions, and holdings are persisted in a local MySQL instance for privacy and speed.
- **Fault Tolerance**: The backend includes extensive error handling to maintain application stability during third-party service outages.

---

## 👨‍💻 Contributing
Contributions are welcome! If you'd like to improve calculations, add new data visualizations, or integrate more AI features:
1. Fork the repo
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
<p align="center">Made with ❤️ for better financial futures.</p>
