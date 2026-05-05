# 🚀 Quick Start Guide: Frontend-Backend Integration

Get the Nestro application running in 5 minutes!

---

## ⚡ 30-Second Setup

```bash
# Terminal 1: Backend
cd backend
python main.py

# Terminal 2: Frontend
cd frontend
npm install
npm run dev
```

Then open: `http://localhost:5173`

---

## 📋 Prerequisites

- **Backend:** Python 3.11+, PostgreSQL running
- **Frontend:** Node.js 18+, npm 9+
- **Network:** Ports 8000 (backend) and 5173 (frontend) available

---

## 🔧 Detailed Setup

### Step 1: Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export JWT_SECRET="your-secret-key-here"
export DATABASE_URL="postgresql://user:password@localhost/nestro"

# Run migrations (if needed)
alembic upgrade head

# Start server
python main.py
# Server runs on http://localhost:8000
```

### Step 2: Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
echo "VITE_API_URL=http://localhost:8000" > .env.local

# Start dev server
npm run dev
# App runs on http://localhost:5173
```

### Step 3: Verify Integration

**Check backend is running:**

```bash
curl http://localhost:8000/health
# Response: {"status":"ok"}
```

**Check frontend loads:**

- Open http://localhost:5173 in browser
- Should see landing page
- No console errors

---

## ✅ Test the Full Flow

### 1. Create Account

```
Go to: http://localhost:5173/signup
Email: test@example.com
Password: password123
Name: Test User
→ Should redirect to /overview
```

### 2. Upload Room Image

```
On /overview, click "Begin your design"
→ Redirects to /upload
Upload an image or use "USE SAMPLE ROOM"
→ Should show analysis tags after 1.8s
```

### 3. Create Design Brief

```
Continue to /design
Enter brief text: "Minimalist, earthy tones, lots of natural light"
Select style: Choose any style
Click "CONTINUE TO ANALYSIS"
→ Should send message to backend
```

### 4. View Analysis

```
On /analysis page
Click "RUN ANALYSIS"
→ Should show 4 agents with progress bars
→ Report should appear after 4.2s
```

### 5. Save Products

```
Click "VIEW PRODUCTS"
→ Product grid appears
Click any product
Click "ADD TO MOOD BOARD"
→ Should see success message
→ Product saved to backend
```

---

## 🎯 API Integration Points

### These endpoints are connected:

- ✅ `POST /auth/login` → SignIn page
- ✅ `POST /auth/register` → SignUp page
- ✅ `POST /sessions` → Auto-created on studio load
- ✅ `POST /chat/message` → Design brief submission
- ✅ `POST /designs/products` → Save products

### These endpoints can be tested:

- `GET /auth/me` → Verify current user
- `GET /sessions` → List user's sessions
- `GET /designs/products` → List saved products

---

## 📊 Monitor Integration

### Browser DevTools Console

```
Check for any errors when:
- Logging in
- Creating session
- Submitting design
- Saving products
```

### Network Tab

```
Watch these requests:
POST /auth/login
POST /sessions
POST /chat/message
POST /designs/products
```

### Backend Logs

```
Should see:
[INFO] 127.0.0.1 - POST /auth/login
[INFO] 127.0.0.1 - POST /sessions
[INFO] 127.0.0.1 - POST /chat/message
[INFO] 127.0.0.1 - POST /designs/products
```

---

## 🐛 Common Issues

### "Cannot connect to backend"

```
Solution:
1. Check backend is running: ps aux | grep python
2. Check port 8000 is open: lsof -i :8000
3. Check VITE_API_URL in .env.local
4. Restart backend and frontend
```

### "Unauthorized" Error

```
Solution:
1. Sign out and sign in again
2. Check JWT_SECRET is same on backend
3. Check token in localStorage
4. Restart backend
```

### "CORS" Errors

```
Solution:
Backend main.py should have:
CORSMiddleware configured for http://localhost:5173
Restart backend after adding CORS
```

### Mock data showing instead of real data

```
This is expected for:
- Room analysis tags (uses mock)
- Agent analysis (uses mock)
- Product recommendations (from data.ts)

Real API integration points:
- Auth endpoints ✅
- Session management ✅
- Design brief submission ✅
- Product saving ✅
```

---

## 📚 Documentation

### For Detailed Information:

- **[INTEGRATION_MAPPING.md](./INTEGRATION_MAPPING.md)** - Complete API mapping
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - What's integrated

### For Development:

```
API Service Layer:     frontend/src/services/api.ts
Mock Services:         frontend/src/services/mock.ts
State Management:      frontend/src/store/forma.ts
Components:            frontend/src/components/forma/
Pages:                 frontend/src/pages/
```

---

## 🔐 Security Checklist

Before deploying to production:

- [ ] Change JWT_SECRET to strong random value
- [ ] Enable HTTPS for all API calls
- [ ] Set VITE_API_URL to production domain
- [ ] Add rate limiting to backend
- [ ] Implement token refresh mechanism
- [ ] Add CORS whitelist to specific domain
- [ ] Enable database encryption
- [ ] Set secure cookies for tokens (not localStorage)
- [ ] Add input validation on backend
- [ ] Set up error monitoring (Sentry, etc.)

---

## 📈 Performance Tips

### Frontend

```
npm run build          # Creates optimized build
npm run preview        # Test production build locally
```

### Backend

```
# Enable caching for static assets
# Use connection pooling for database
# Implement query optimization
# Add monitoring and logging
```

---

## 🎓 Learn the Architecture

### Frontend Flow

```
User Input
    ↓
React Component
    ↓
Zustand Store Update
    ↓
API Service Call
    ↓
Backend Response
    ↓
UI Update
```

### Key Files to Understand

1. **api.ts** - How API calls work
2. **forma.ts** - How state is managed
3. **SignIn.tsx** - How authentication works
4. **BriefPanel.tsx** - How data submission works
5. **Studio.tsx** - How session initialization works

---

## 🚀 Deployment

### Frontend Deployment (Vercel)

```bash
npm install -g vercel
vercel
# Follow prompts
# Set VITE_API_URL to production backend URL
```

### Backend Deployment (Heroku/Railway)

```bash
# See backend deployment docs
# Ensure DATABASE_URL and JWT_SECRET are set
# Scale to 2+ dynos for production
```

---

## 📞 Support

### Issues?

1. Check documentation files
2. Review error messages in console
3. Check network requests in DevTools
4. Verify backend is running
5. Check .env.local is configured

### Want to extend?

- See INTEGRATION_MAPPING.md for endpoint details
- Add new API calls to api.ts
- Add new components and wire to existing API calls
- Update Zustand store for new state

---

## ✨ You're All Set!

The application is now fully integrated and ready to use.

**Next steps:**

1. Test the complete user flow
2. Verify all integrations work
3. Customize for your needs
4. Deploy to production

Enjoy! 🎉

---

**Last Updated:** May 5, 2026  
**Quick Start Guide v1.0**
