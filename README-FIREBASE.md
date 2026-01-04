# Firebase Configuration Setup (Node.js)

## ✅ Setup Complete!

Your project is now using **Node.js** to manage Firebase configuration with environment variables.

---

## 📋 Quick Start

### 1. Fill in your `.env` file

Your `.env` file should look like this:

```env
API_KEY=AIzaSyDJFBP0LvQvKccimm4Srot3yxCslu5Er2U
AUTH_DOMAIN=portfolio-3b10e.firebaseapp.com
PROJECT_ID=portfolio-3b10e
STORAGE_BUCKET=portfolio-3b10e.firebasestorage.app
MESSAGING_SENDER_ID=378930316704
APP_ID=1:378930316704:web:78834e552ec9d2863e90c5
MEASUREMENT_ID=G-471GM3WFB8
```

**Format Rules:**
- Each line: `KEY=VALUE` (no spaces around `=`)
- No quotes needed
- No empty lines between entries

### 2. Install dependencies (first time only)

```bash
npm install
```

### 3. Generate Firebase config

```bash
npm run build:config
```

This will:
- ✅ Read your `.env` file using `process.env`
- ✅ Generate `js/firebase-config.js` with your credentials
- ✅ Show warnings if any values are missing

### 4. Start your server

```bash
npm start
```

Or use the Python server directly:
```bash
python3 -m http.server 8000
```

---

## 🚀 Available Scripts

```bash
# Generate firebase config from .env
npm run build:config

# Generate config AND start server
npm run dev

# Just start server (no config generation)
npm start
```

---

## 🔧 How It Works

1. **`dotenv` package** reads your `.env` file
2. **`build-firebase-config.js`** uses `process.env.API_KEY`, etc.
3. Generates `js/firebase-config.js` with actual values
4. Both `.env` and generated config are gitignored

---

## 📁 Files

- **`.env`** - Your Firebase credentials (gitignored, create this!)
- **`build-firebase-config.js`** - Node.js build script
- **`package.json`** - Node.js dependencies and scripts
- **`js/firebase-config.js`** - Generated config (gitignored)
- **`env.example`** - Example format for `.env`

---

## 🔐 Security

- ✅ `.env` is gitignored
- ✅ `js/firebase-config.js` is gitignored  
- ✅ Your credentials stay private
- ✅ Safe to push to GitHub

**Note:** Firebase client-side keys are actually safe to be public (protected by Firebase Security Rules), but using `.env` is still best practice!

---

## 🆘 Troubleshooting

### "Some environment variables are missing"

Check your `.env` file format:
```env
API_KEY=your-value-here
```

NOT:
```env
API_KEY
```

### "Can't find module 'dotenv'"

Run:
```bash
npm install
```

### Changes not showing?

Run the build script again:
```bash
npm run build:config
```

---

## 🎉 You're All Set!

Your portfolio now uses **Node.js + dotenv** for environment variables, just like a professional web application!

Next: Fill in your `.env` file with your actual Firebase values and run `npm run build:config`.

