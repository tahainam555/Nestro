# Nestro Frontend-Backend Integration Mapping

## Overview

This document provides a complete mapping of frontend components and their integration with backend APIs and mock services.

---

## 🔐 Authentication Flow

### SignIn Component

**File:** `frontend/src/pages/SignIn.tsx`

| Feature              | Implementation                                       | Status |
| -------------------- | ---------------------------------------------------- | ------ |
| Email/Password Input | React form state                                     | ✅     |
| Form Validation      | Client-side validation                               | ✅     |
| Backend Connection   | `/auth/login` endpoint                               | ✅     |
| Token Storage        | `localStorage.setItem('auth_token', token)`          | ✅     |
| State Management     | Zustand store (`setAuthToken`, `setIsAuthenticated`) | ✅     |
| Error Handling       | Toast notifications & error display                  | ✅     |
| Loading State        | `isSubmitting` state with disabled UI                | ✅     |

**API Endpoint:**

```
POST /auth/login
Request: { email: string, password: string }
Response: { access_token: string, token_type: "bearer", expires_in: number }
```

**Data Flow:**

1. User enters credentials → Form validation
2. Call `login(payload)` from `api.ts`
3. Success → Store token in localStorage & Zustand
4. Redirect to `/overview`

---

### SignUp Component

**File:** `frontend/src/pages/SignUp.tsx`

| Feature                   | Implementation                              | Status |
| ------------------------- | ------------------------------------------- | ------ |
| Name/Email/Password Input | React form state                            | ✅     |
| Form Validation           | Client-side validation                      | ✅     |
| Backend Connection        | `/auth/register` endpoint                   | ✅     |
| Token Storage             | `localStorage.setItem('auth_token', token)` | ✅     |
| State Management          | Zustand store                               | ✅     |
| Error Handling            | Toast notifications                         | ✅     |
| Loading State             | `isSubmitting` state                        | ✅     |

**API Endpoint:**

```
POST /auth/register
Request: { email: string, password: string, name: string }
Response: { access_token: string, token_type: "bearer", expires_in: number }
```

---

## 🏢 Studio Shell & Session Management

### Studio Component

**File:** `frontend/src/pages/Studio.tsx`

| Feature                       | Implementation                        | Status |
| ----------------------------- | ------------------------------------- | ------ |
| Auth Check                    | `isAuthenticated()` check on mount    | ✅     |
| Session Creation              | `createSession()` API call            | ✅     |
| Session Storage               | Store in Zustand (`currentSessionId`) | ✅     |
| Redirect if Not Authenticated | Redirect to `/signin`                 | ✅     |

**API Endpoint:**

```
POST /sessions
Headers: { Authorization: "Bearer {token}" }
Response: { session_id: string, created_at: string }
```

**Data Flow:**

1. Component mounts → Check authentication
2. If authenticated → Create new session
3. Store `session_id` in Zustand store
4. Use `session_id` for all subsequent chat/design operations

---

## 🎨 Design Workflow

### 1. Upload Room Image

**Component:** `UploadPanel`
**File:** `frontend/src/components/forma/UploadPanel.tsx`

| Feature               | Implementation                                | Status |
| --------------------- | --------------------------------------------- | ------ |
| File Upload           | HTML input with drag-drop                     | ✅     |
| File Handling         | `URL.createObjectURL()` for preview           | ✅     |
| Image Analysis        | Mock service (`generateMockRoomAnalysisTags`) | ✅     |
| Analysis Tags Display | Animated tag display                          | ✅     |
| State Management      | Zustand (`uploadedImage`, `setUploaded`)      | ✅     |
| Mock Delay            | 1800ms simulated processing                   | ✅     |

**Mock Service:**

```typescript
generateMockRoomAnalysisTags(): string[]
- Returns 5-8 random room elements
- Simulates computer vision analysis
- Delay: 1800ms
```

**Data Flow:**

1. User uploads image → Preview displayed
2. Mock analysis runs (1.8s delay)
3. Detection tags shown with animation
4. Navigate to design brief when ready

---

### 2. Design Brief & Style Selection

**Component:** `BriefPanel`
**File:** `frontend/src/components/forma/BriefPanel.tsx`

| Feature             | Implementation            | Status |
| ------------------- | ------------------------- | ------ |
| Brief Textarea      | Editable text input       | ✅     |
| Style Selection     | Grid with image selection | ✅     |
| Form Validation     | Required field validation | ✅     |
| Backend Connection  | `/chat/message` endpoint  | ✅     |
| Session Integration | Uses `currentSessionId`   | ✅     |
| Loading State       | `isSubmitting` state      | ✅     |
| Error Handling      | Toast notifications       | ✅     |

**API Endpoint:**

```
POST /chat/message
Form Data:
  - session_id: string
  - message: string (design brief + style)
  - image: File (optional)

Response: { session_id, reply, tools_used[], design_plan?, products[] }
```

**Data Flow:**

1. User enters brief text and selects style
2. Validation checks for required fields
3. Send message to backend with brief + style info
4. Store design brief data in Zustand
5. Navigate to analysis page

---

### 3. Room Analysis

**Component:** `AgentsPanel`
**File:** `frontend/src/components/forma/AgentsPanel.tsx`

| Feature              | Implementation                          | Status |
| -------------------- | --------------------------------------- | ------ |
| Pre-analysis Display | "Analyzing Your Space" message          | ✅     |
| Agent Progress Bars  | Animated progress for 4 agents          | ✅     |
| Analysis Simulation  | Mock delay (4200ms)                     | ✅     |
| Report Generation    | Display design report                   | ✅     |
| State Management     | Zustand (`agentsRunning`, `agentsDone`) | ✅     |

**Mock Service:**

```typescript
simulateAgentAnalysis(delayMs?: number): Promise<void>
- Default delay: 2500ms
- Used for: generating recommendations
```

**Data Flow:**

1. User clicks "RUN ANALYSIS"
2. Progress bars animate for 4.2 seconds
3. Mock analysis completes
4. Design report displayed with:
   - Dominant materials
   - Color palette
   - Light index
   - Recommended mood
   - Budget estimate
   - Sustainability rating
5. "VIEW PRODUCTS" button navigates to results

---

### 4. Product Recommendations & Curation

**Component:** `ProductsPanel`
**File:** `frontend/src/components/forma/ProductsPanel.tsx`

| Feature            | Implementation                | Status |
| ------------------ | ----------------------------- | ------ |
| Product Grid       | Responsive grid layout        | ✅     |
| Category Filtering | Dynamic filter buttons        | ✅     |
| Product Selection  | Opens detail drawer           | ✅     |
| Product Details    | Shows specs, reasoning, price | ✅     |
| Save Product       | `/designs/products` endpoint  | ✅     |
| Loading State      | `isSaving` state              | ✅     |
| Error Handling     | Toast notifications           | ✅     |

**API Endpoint - Save Product:**

```
POST /designs/products
Request: {
  product_id: string,
  name: string,
  price: number,
  url: string,
  image_url?: string,
  category?: string
}
Response: SavedProductResponse
```

**Data Flow:**

1. Products displayed (mock data from `data.ts`)
2. User clicks product → Detail drawer opens
3. User clicks "ADD TO MOOD BOARD"
4. Save product to backend
5. Success toast shown
6. Product stored in user's mood board

---

## 💾 Saved Designs & State Persistence

### Saved Designs Page

**File:** `frontend/src/pages/studio/SavedDesigns.tsx`

| Feature             | Implementation              | Status    |
| ------------------- | --------------------------- | --------- |
| List Saved Designs  | Mock data in Zustand        | ✅        |
| Design Card Display | Card grid with image & info | ✅        |
| Filter by Status    | Draft, completed, archived  | ⏳ (Mock) |
| Load Design         | Restore session/design data | ⏳ (Mock) |
| Delete Design       | Remove from saved list      | ⏳ (Mock) |

**Mock Service:**

```typescript
generateMockSavedDesigns(): MockSavedDesign[]
- Returns 4 pre-populated design projects
- Includes: name, style, budget, created_at, status
```

---

## 📊 Zustand State Management

### Store Structure

**File:** `frontend/src/store/forma.ts`

#### Authentication State

```typescript
user: User | null; // Current user info
isAuthenticated: boolean; // Auth status
authToken: string | null; // JWT token
isAuthLoading: boolean; // Auth operation loading
authError: string | null; // Auth errors
```

#### Session State

```typescript
currentSessionId: string | null      // Active session ID
sessions: SessionItem[]              // User's sessions
isSessionsLoading: boolean           // Sessions loading state
```

#### Design Workflow State

```typescript
uploadedImage: string | null; // Base64 or blob URL
analysisDone: boolean; // Room scan completed
brief: string; // User's design brief
selectedStyle: string | null; // Selected design style
designBriefData: DesignBriefData; // Full brief data
```

#### Analysis & Results State

```typescript
agentsRunning: boolean               // Analysis in progress
agentsDone: boolean                  // Analysis completed
reportReady: boolean                 // Report generated
products: Product[]                  // Recommended products
isProductsLoading: boolean           // Products loading
```

---

## 🔌 API Service Layer

**File:** `frontend/src/services/api.ts`

### Authentication Functions

```typescript
register(payload: RegisterPayload): Promise<ApiResponse<AuthResponse>>
login(payload: LoginPayload): Promise<ApiResponse<AuthResponse>>
getCurrentUser(): Promise<ApiResponse<UserResponse>>
setAuthToken(token: string): void
clearAuthToken(): void
getAuthToken(): string | null
isAuthenticated(): boolean
```

### Session Functions

```typescript
createSession(): Promise<ApiResponse<CreateSessionResponse>>
listSessions(): Promise<ApiResponse<SessionsListResponse>>
deleteSession(sessionId: string): Promise<ApiResponse<DeleteSessionResponse>>
```

### Chat Functions

```typescript
sendMessage(sessionId, message, image?): Promise<ApiResponse<ChatResponse>>
getChatHistory(sessionId): Promise<ApiResponse<HistoryResponse>>
```

### Design Functions

```typescript
createDesign(payload: CreateDesignRequest): Promise<ApiResponse<DesignResponse>>
saveProduct(payload: SaveProductRequest): Promise<ApiResponse<SavedProductResponse>>
getSavedProducts(): Promise<ApiResponse<SavedProductsGroupedResponse>>
removeSavedProduct(productId: string): Promise<ApiResponse<DeleteProductResponse>>
```

---

## 🎭 Mock Service Layer

**File:** `frontend/src/services/mock.ts`

### Mock Functions

```typescript
generateMockRoomAnalysisTags(): string[]
generateMockRoomAnalysis(): MockRoomAnalysis
generateMockProductRecommendations(style, brief): Product[]
generateMockSavedDesigns(): MockSavedDesign[]
generateMockLayoutSuggestion(): Record<string, unknown>
simulateAgentAnalysis(delayMs?): Promise<void>
```

---

## 🔄 Complete User Flow

### Happy Path: End-to-End Design Session

```
1. Landing Page (/
   ↓ "Start Designing"
2. SignIn (/signin)
   → User enters credentials
   → Backend auth (/auth/login)
   → Token stored → Navigate to /overview
   ↓ "Begin your design"
3. Studio Shell (authenticated)
   → Create session (POST /sessions)
   → Store sessionId in state
   ↓ Route to /upload
4. Upload Room (/upload)
   → User uploads image
   → Mock analysis (1.8s)
   → Tags displayed
   ↓ "Continue to Brief"
5. Design Brief (/design)
   → User enters brief text
   → User selects style
   → Send to backend (POST /chat/message)
   ↓ "Continue to Analysis"
6. Analysis (/analysis)
   → Agent progress bars animate (4.2s)
   → Report generated with mock data
   ↓ "View Products"
7. Results (/results)
   → Product grid displayed
   → User clicks products to view details
   → User saves products (POST /designs/products)
   ↓ Navigate to /saved
8. Saved Designs (/saved)
   → All saved projects displayed
   → Can review or start new design
```

---

## 🎯 Environment Configuration

### Frontend Environment Variables

**File:** `.env.local`

```
VITE_API_URL=http://localhost:8000
```

This configures the base URL for all backend API calls in `api.ts`.

---

## 🚨 Error Handling Strategy

### API Errors

- **400 Bad Request:** Validation errors → Toast message
- **401 Unauthorized:** Token invalid → Redirect to `/signin`
- **404 Not Found:** Resource missing → Toast message
- **500 Server Error:** Backend error → Toast message

### Network Errors

- **Connection failed:** Display offline message
- **Timeout:** Retry mechanism (configurable)

### Form Validation

- **Client-side:** Validate before API call
- **Server-side:** Backend validates, returns 400 if invalid
- **User feedback:** Toast notifications for all errors

---

## 📝 Session Persistence

### Token Storage

- **Location:** `localStorage` (key: `auth_token`)
- **Retrieval:** On app load, check `getAuthToken()` and restore session
- **Cleanup:** On logout, `clearAuthToken()` removes token

### Design Session Data

- **Location:** Zustand store (in-memory)
- **Scope:** Current design session only
- **Persistence:** Can be saved to backend via `/designs` endpoint

---

## 🧪 Testing the Integration

### Authentication Flow Test

```
1. Visit /signin
2. Enter test credentials
3. Submit form
4. Verify token in localStorage
5. Verify redirect to /overview
6. Verify currentSessionId in state
```

### Design Workflow Test

```
1. Upload room image → Verify mock tags appear
2. Enter brief & select style → Verify submission
3. View agents page → Verify progress animation
4. View products → Verify product grid
5. Save product → Verify success toast
```

### Session Management Test

```
1. Create session → Verify sessionId stored
2. Send message → Verify sessionId used
3. Save design → Verify backend call
4. Load saved designs → Verify data persisted
```

---

## 📚 Architecture Decision Log

### Why Zustand for State?

- ✅ Lightweight and flexible
- ✅ No boilerplate compared to Redux
- ✅ Good for this use case (not complex data flow)
- ✅ Easy to persist to localStorage if needed

### Why Mock Services?

- ✅ Provide realistic delays simulating backend
- ✅ Allow frontend development without complete backend
- ✅ Easy to replace with real API calls later
- ✅ Better UX (progress bars, animations) than instant responses

### Why Separate API Layer?

- ✅ Centralized API logic
- ✅ Consistent error handling
- ✅ Easy to switch between mock/real APIs
- ✅ Type-safe with TypeScript interfaces
- ✅ Reusable across components

### Why Multi-step Workflow?

- ✅ Guides user through process
- ✅ Better UX with clear progress
- ✅ Matches design intent
- ✅ Each step can be independent API call

---

## 🔮 Future Enhancements

### Backend Integration

- [ ] Replace mock room analysis with real vision API
- [ ] Replace mock agents with real ML agents
- [ ] Add real-time chat with backend
- [ ] Persist all design data to database

### Frontend Improvements

- [ ] Add undo/redo functionality
- [ ] Enable design sharing between users
- [ ] Add collaborative design sessions
- [ ] Implement design history/timeline

### Data Persistence

- [ ] Save design drafts (auto-save)
- [ ] Export design as PDF
- [ ] Share design links
- [ ] Save to user profile

---

## 📞 Support & Troubleshooting

### Common Issues

**Q: Token not persisting after refresh?**
A: Check localStorage for `auth_token` key. If missing, user needs to sign in again.

**Q: Session not created on page load?**
A: Verify user is authenticated via `isAuthenticated()` check in `Studio.tsx`.

**Q: Products not loading?**
A: Check if session is active. Products require valid `currentSessionId`.

**Q: Mock analysis not running?**
A: Verify `simulateAgentAnalysis()` is called in `AgentsPanel`.

---

## 📊 Component Dependency Map

```
App.tsx
├── Landing.tsx
├── SignIn.tsx → api.ts (login)
├── SignUp.tsx → api.ts (register)
└── Studio.tsx → api.ts (createSession)
    ├── AppSidebar.tsx
    ├── UploadPanel.tsx → mock.ts (generateMockRoomAnalysisTags)
    ├── BriefPanel.tsx → api.ts (sendMessage)
    ├── AgentsPanel.tsx → mock.ts (simulateAgentAnalysis)
    ├── ProductsPanel.tsx → api.ts (saveProduct)
    └── SavedDesigns.tsx → mock.ts (generateMockSavedDesigns)

Store: forma.ts (Zustand)
├── Authentication state
├── Session state
├── Design workflow state
└── Results state

Services:
├── api.ts (Backend API calls)
└── mock.ts (Mock implementations)
```

---

**Last Updated:** May 5, 2026  
**Version:** 1.0  
**Status:** Production Ready with Mocks
