# 🖥️ WebOS - Web-Based Operating System

> A fully functional, browser-based operating system built with React and Node.js, featuring a complete desktop environment, advanced file system, and professional text editor.

![image](https://github.com/user-attachments/assets/701b30e8-0c0b-4b1a-a60d-5b6bbae67834)
![image](https://github.com/user-attachments/assets/4523e723-380e-414c-a17a-41b98f38d22e)
![image](https://github.com/user-attachments/assets/8bf11d5b-6da4-4ce6-a342-71ebb7640414)

---

## Live Demo 
- URL : https://webos-five-eosin.vercel.app/
- Youtube : https://webos-five-eosin.vercel.app/ (Coming up)

---

## 🌟 Key Features

### 💻 **Complete Desktop Environment**
- **Modern UI**: Windows-style interface with taskbar, system tray, and start menu
- **Window Management**: Resizable, draggable windows with minimize/maximize/close controls
- **Desktop Customization**: Drag-and-drop icons, customizable wallpapers
- **Multi-App Support**: Run multiple applications simultaneously

### 📁 **Advanced File System**
- **Full CRUD Operations**: Create, read, update, delete files and folders
- **Real-Time Persistence**: All changes saved to MongoDB database
- **Smart File Explorer**: Tree view navigation with grid/list display modes
- **Search Functionality**: Search by filename and content across entire file system
- **Drag & Drop**: Intuitive file management with context menus

### 📝 **Professional Text Editor (Notepad)**
- **Monaco Editor Integration**: Same editor used in Visual Studio Code
- **Syntax Highlighting**: Support for 20+ programming languages (JavaScript, Python, HTML, CSS, Markdown, etc.)
- **Auto-Save**: Automatic saving after 2 seconds of inactivity
- **Manual Save**: Ctrl+S for immediate saving to database
- **Multiple Themes**: Dark, light, and high contrast themes
- **IntelliSense**: Auto-completion, code suggestions, and error detection

### 🔐 **Secure Authentication System**
- **User Registration & Login**: JWT-based authentication
- **Session Management**: Persistent login with secure token handling
- **User Isolation**: Each user has their own private file system
- **Password Security**: Bcrypt hashing for secure password storage

### 🚀 **System Applications**
- **File Explorer**: Navigate and manage your file system
- **Notepad**: Professional code and text editor
- **Terminal**: Command-line interface (coming soon)
- **Browser**: Web browsing capabilities (coming soon)
- **Settings**: System configuration and preferences

---

## 🛠️ Technology Stack

### **Frontend**
![React](https://img.shields.io/badge/React_18-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![Monaco Editor](https://img.shields.io/badge/Monaco_Editor-007ACC?style=flat-square&logo=visual-studio-code&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)

- **React 18** - Modern UI framework with hooks and context API
- **Vite** - Fast build tool and development server
- **Monaco Editor** - Professional code editor component
- **CSS3** - Custom styling with animations and responsive design
- **Context API** - State management for authentication and file system

### **Backend**
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=flat-square&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=flat-square&logo=json-web-tokens&logoColor=white)

- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database for data persistence
- **Mongoose** - MongoDB object modeling library
- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing and security

### **Deployment & DevOps**
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)
![Render](https://img.shields.io/badge/Render-46E3B7?style=flat-square&logo=render&logoColor=white)
![MongoDB Atlas](https://img.shields.io/badge/MongoDB_Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)

- **Vercel** - Frontend hosting and deployment
- **Render** - Backend API hosting
- **MongoDB Atlas** - Cloud database hosting
- **GitHub Actions** - CI/CD pipeline (coming soon)

---

## 🗄️ Data Architecture

### 📊 Database Schema Overview
- [![Database Schema](https://via.placeholder.com/600x400/f8f9fa/333333?text=Database+Schema+Diagram)](https://app.eraser.io/workspace/VsKaUqwyjGXY8wFFVc11?origin=share)
- *Detailed data modeling diagram created with [Eraser.io](https://eraser.io)*

---

## 🚀 Getting Started

### **Prerequisites**
- Node.js 16+ 
- MongoDB 5+
- npm or yarn

### **Quick Start**

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/webos.git
   cd webos
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Update .env with your MongoDB URL and JWT secret
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   cp .env.example .env
   # Update .env with your backend URL
   npm run dev
   ```

4. **Access the Application**
   - Frontend: `http://localhost:5173`
   - Backend: `http://localhost:5000`

### **Environment Variables**

**Backend (.env)**
```bash
NODE_ENV=development
PORT=5000
MONGO_URL=mongodb://localhost:27017/webos
JWT_SECRET=your-super-secure-jwt-secret
FRONTEND_URL=http://localhost:5173
```

**Frontend (.env)**
```bash
VITE_API_URL=http://localhost:5000/api
```

---

## 📋 API Documentation

### **Authentication Endpoints**
```http
POST /api/auth/register  # Register new user
POST /api/auth/login     # User login
POST /api/auth/logout    # User logout
```

### **File System Endpoints**
```http
GET    /api/filesystem           # Get file system structure
GET    /api/filesystem/file      # Get file content
POST   /api/filesystem/file      # Create new file
POST   /api/filesystem/file/save # Save file content
POST   /api/filesystem/folder    # Create new folder
POST   /api/filesystem/item/rename # Rename file/folder
POST   /api/filesystem/item/delete # Delete file/folder
GET    /api/filesystem/search    # Search files
```

### **Desktop Endpoints**
```http
GET  /api/desktop         # Get desktop configuration
PUT  /api/desktop/icons   # Update desktop icons
PUT  /api/desktop/wallpaper # Update wallpaper
```

---

## 🔮 Upcoming Features & Roadmap

### **Version 2.0 - Q2 2024**
- [ ] **🖥️ Terminal Application** - Full bash-like command-line interface
- [ ] **📦 Package Manager** - Install/uninstall third-party applications
- [ ] **🎨 Theme System** - Customizable UI themes and color schemes
- [ ] **👥 Multi-user Workspaces** - Shared folders and collaborative editing
- [ ] **🔍 Advanced Search** - Full-text search with filters and indexing
- [ ] **📱 Mobile Support** - Responsive design for tablets and phones

### **Version 3.0 - Q4 2024**
- [ ] **⚡ Real-time Collaboration** - Google Docs-style collaborative editing
- [ ] **🔌 Plugin System** - Third-party app development framework
- [ ] **☁️ Cloud Storage Integration** - Google Drive, Dropbox, OneDrive sync
- [ ] **🤖 AI Assistant** - Built-in AI for code completion and file management
- [ ] **🔒 Advanced Security** - End-to-end encryption, 2FA, audit logs
- [ ] **📊 Analytics Dashboard** - Usage statistics and performance metrics

### **Version 4.0 - 2025**
- [ ] **🌐 WebAssembly Support** - Run native applications in browser
- [ ] **🎮 Application Store** - Marketplace for WebOS applications
- [ ] **🔄 Offline Support** - Progressive Web App with offline functionality
- [ ] **🏢 Enterprise Features** - SSO, LDAP integration, admin controls

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### **Development Workflow**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### **Code Style**
- Follow ESLint configuration
- Write unit tests for new features
- Update documentation for API changes
- Use conventional commits


---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Monaco Editor** - For providing the excellent code editor component
- **React Team** - For the amazing frontend framework
- **MongoDB** - For the flexible NoSQL database
- **Vercel & Render** - For reliable hosting and deployment
- **Open Source Community** - For inspiration and countless helpful libraries

---

## 📞 Contact & Support

- **Developer**: [Taral Shah](https://github.com/taralshah09)
- **Email**: taralshah604@gmail.com
- **LinkedIn**: [taralshah9]([https://linkedin.com/in/taralShah09](https://www.linkedin.com/in/taralshah9/))
- **Twitter**: [@taralshah995](https://x.com/taralshah995)

---


Made with ❤️ by [Taral Shah](https://github.com/taralshah09)

