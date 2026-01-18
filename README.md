# Eyeluxe Management System

A modern, responsive business management application for optical stores built with React, Node.js, and Firebase.

## 🚀 Features

- **Dashboard Analytics** - Real-time business insights and metrics
- **Inventory Management** - Track products, stock levels, and pricing
- **Rental Management** - Manage ornament rentals with customer tracking
- **Billing System** - Generate invoices and manage sales
- **Expense Tracking** - Monitor business expenditures
- **Reports & Analytics** - Comprehensive business analytics

## 📱 Responsive Design

Fully responsive interface that works seamlessly across:
- 💻 Desktop computers
- 📱 Tablets
- 📱 Mobile phones

## 🛠️ Tech Stack

### Frontend
- **React** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Axios** - HTTP client
- **React Router** - Navigation

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **Firebase** - Database & Authentication
- **CORS** - Cross-origin support

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase account

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/eyeluxe.git
cd eyeluxe
```

2. **Install server dependencies**
```bash
cd server
npm install
```

3. **Install client dependencies**
```bash
cd ../client
npm install
```

4. **Configure environment variables**

Create a `.env` file in the `server` folder:
```env
PORT=5000
FIREBASE_PROJECT_ID=your-project-id
```

5. **Add Firebase credentials**
- Place your `serviceAccountKey.json` in the `server` folder
- Update `client/src/firebase.js` with your Firebase config

## 🚀 Running the Application

### Development Mode

1. **Start the backend server**
```bash
cd server
npm run dev
```
Server will run on `http://localhost:5000`

2. **Start the frontend client** (in a new terminal)
```bash
cd client
npm run dev
```
Client will run on `http://localhost:5173`

### Production Build

```bash
cd client
npm run build
```

## 📁 Project Structure

```
eyeluxe/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── assets/        # Images and static files
│   │   └── index.css      # Global styles
│   └── package.json
├── server/                # Backend Node.js application
│   ├── routes/           # API routes
│   ├── firebase.js       # Firebase configuration
│   ├── index.js          # Server entry point
│   └── package.json
└── README.md
```

## 🔒 Security Notes

- Never commit `.env` files or `serviceAccountKey.json`
- Keep Firebase credentials secure
- Use environment variables for sensitive data

## 📝 License

This project is private and proprietary.

## 👤 Author

Eyeluxe Management System

---

Built with ❤️ using React and Node.js
