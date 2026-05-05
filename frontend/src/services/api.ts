/**
 * Centralized API Service Layer
 * Handles all backend communication for the Nestro application
 */

const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");
const API_PREFIX = "/api/v1";
const MOCK_LATENCY_MS = 450;

const apiUrl = (endpoint: string) => {
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  if (path === "/health" || path.startsWith(API_PREFIX)) {
    return `${API_BASE_URL}${path}`;
  }
  return `${API_BASE_URL}${API_PREFIX}${path}`;
};

/**
 * API Response wrapper for consistent error handling
 */
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  status: number;
}

/**
 * Helper function to make API requests
 */
async function apiRequest<T>(
  method: string,
  endpoint: string,
  body?: unknown,
  includeAuth: boolean = true
): Promise<ApiResponse<T>> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Add JWT token if available
    if (includeAuth) {
      const token = localStorage.getItem("auth_token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    const options: RequestInit = {
      method,
      headers,
    };

    if (body && (method === "POST" || method === "PUT" || method === "PATCH")) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(apiUrl(endpoint), options);

    // Handle successful responses
    if (response.ok) {
      const data = response.status === 204 ? null : await response.json();
      return {
        success: true,
        data,
        status: response.status,
      };
    }

    // Handle error responses
    let errorMessage = "An error occurred";
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorMessage;
    } catch {
      errorMessage = response.statusText || errorMessage;
    }

    return {
      success: false,
      error: errorMessage,
      status: response.status,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Network error";
    return {
      success: false,
      error: errorMessage,
      status: 0,
    };
  }
}

/**
 * Form data helper for multipart requests
 */
function createFormData(data: Record<string, unknown>): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(data)) {
    if (value instanceof File) {
      formData.append(key, value);
    } else if (typeof value === "object") {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, String(value));
    }
  }
  return formData;
}

/**
 * Multipart request helper
 */
async function apiRequestMultipart<T>(
  method: string,
  endpoint: string,
  formData: FormData
): Promise<ApiResponse<T>> {
  try {
    const headers: Record<string, string> = {};

    // Add JWT token if available
    const token = localStorage.getItem("auth_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const options: RequestInit = {
      method,
      headers,
      body: formData,
    };

    const response = await fetch(apiUrl(endpoint), options);

    if (response.ok) {
      const data = response.status === 204 ? null : await response.json();
      return {
        success: true,
        data,
        status: response.status,
      };
    }

    let errorMessage = "An error occurred";
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorMessage;
    } catch {
      errorMessage = response.statusText || errorMessage;
    }

    return {
      success: false,
      error: errorMessage,
      status: response.status,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Network error";
    return {
      success: false,
      error: errorMessage,
      status: 0,
    };
  }
}

/**
 * Health check
 */
export async function checkHealth(): Promise<boolean> {
  const response = await apiRequest<{ status: string }>('GET', '/health', undefined, false);
  return response.success && ["ok", "degraded"].includes(response.data?.status || "");
}

const mockDelay = () => new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));

function shouldUseMock(response: ApiResponse<unknown>): boolean {
  return response.status === 0 || response.status >= 500;
}

function mockToken(email: string): AuthResponse {
  return {
    access_token: `mock-token-${btoa(email).replace(/=+$/, "")}-${Date.now()}`,
    token_type: "bearer",
    expires_in: 24 * 60 * 60,
  };
}

function storedMockUser(): UserResponse | null {
  const raw = localStorage.getItem("mock_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserResponse;
  } catch {
    return null;
  }
}

function saveMockUser(user: UserResponse): void {
  localStorage.setItem("mock_user", JSON.stringify(user));
}

function mockResponse<T>(data: T, status = 200): ApiResponse<T> {
  return { success: true, data, status };
}

/**
 * AUTHENTICATION ENDPOINTS
 */

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export async function register(payload: RegisterPayload): Promise<ApiResponse<AuthResponse>> {
  const response = await apiRequest<AuthResponse>('POST', '/auth/register', payload, false);
  if (!shouldUseMock(response)) return response;

  await mockDelay();
  saveMockUser({
    id: crypto.randomUUID(),
    email: payload.email,
    name: payload.name,
    created_at: new Date().toISOString(),
  });
  return mockResponse(mockToken(payload.email), 201);
}

export async function login(payload: LoginPayload): Promise<ApiResponse<AuthResponse>> {
  const response = await apiRequest<AuthResponse>('POST', '/auth/login', payload, false);
  if (!shouldUseMock(response)) return response;

  await mockDelay();
  const user = storedMockUser() || {
    id: crypto.randomUUID(),
    email: payload.email,
    name: payload.email.split("@")[0] || "Nestro User",
    created_at: new Date().toISOString(),
  };
  saveMockUser(user);
  return mockResponse(mockToken(payload.email));
}

export async function getCurrentUser(): Promise<ApiResponse<UserResponse>> {
  const response = await apiRequest<UserResponse>('GET', '/auth/me');
  if (!shouldUseMock(response)) return response;

  await mockDelay();
  const user = storedMockUser();
  return user
    ? mockResponse(user)
    : { success: false, error: "No signed-in user found", status: 401 };
}

/**
 * SESSION ENDPOINTS
 */

export interface CreateSessionResponse {
  session_id: string;
  created_at: string;
}

export interface SessionItem {
  session_id: string;
  created_at: string;
  status: string;
  last_message_preview: string | null;
}

export interface SessionsListResponse {
  sessions: SessionItem[];
}

export async function createSession(): Promise<ApiResponse<CreateSessionResponse>> {
  const response = await apiRequest<CreateSessionResponse>('POST', '/sessions');
  if (!shouldUseMock(response)) return response;

  await mockDelay();
  return mockResponse({
    session_id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  }, 201);
}

export async function listSessions(): Promise<ApiResponse<SessionsListResponse>> {
  return apiRequest<SessionsListResponse>('GET', '/sessions');
}

export async function deleteSession(sessionId: string): Promise<ApiResponse<{ session_id: string; status: string }>> {
  return apiRequest('DELETE', `/sessions/${sessionId}`);
}

/**
 * CHAT ENDPOINTS
 */

export interface ChatResponse {
  session_id: string;
  reply: string;
  tools_used: string[];
  design_plan: Record<string, unknown> | null;
  products: Array<Record<string, unknown>>;
  created_at: string;
}

export interface HistoryMessage {
  id: string;
  role: string;
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface HistoryResponse {
  session_id: string;
  messages: HistoryMessage[];
}

export async function sendMessage(
  sessionId: string,
  message: string,
  image?: File
): Promise<ApiResponse<ChatResponse>> {
  const formData = new FormData();
  formData.append('session_id', sessionId);
  formData.append('message', message);
  if (image) {
    formData.append('image', image);
  }

  const response = await apiRequestMultipart<ChatResponse>('POST', '/chat/message', formData);
  if (!shouldUseMock(response)) return response;

  await mockDelay();
  return mockResponse({
    session_id: sessionId,
    reply: "Brief received. I have enough context to analyze the room, style direction, budget, and product fit.",
    tools_used: ["mock_intent_parser", "mock_design_agent"],
    design_plan: {
      budget_range: "mid",
      notes: message,
    },
    products: [],
    created_at: new Date().toISOString(),
  });
}

export async function getChatHistory(sessionId: string): Promise<ApiResponse<HistoryResponse>> {
  return apiRequest<HistoryResponse>('GET', `/chat/history/${encodeURIComponent(sessionId)}`);
}

/**
 * DESIGN ENDPOINTS
 */

export interface CreateDesignRequest {
  session_id: string;
  room_type: string;
  style: string;
  budget: number;
  layout_json: Record<string, unknown>;
  mood_board_url?: string;
}

export interface DesignResponse {
  id: string;
  session_id: string;
  room_type: string;
  style: string;
  budget: number;
  layout_json: Record<string, unknown>;
  mood_board_url: string | null;
  created_at: string;
}

export interface SaveProductRequest {
  product_id: string;
  name: string;
  price: number;
  url: string;
  image_url?: string;
  category?: string;
}

export interface SavedProductResponse {
  id: string;
  product_id: string;
  name: string;
  price: number;
  url: string;
  image_url: string | null;
  category: string | null;
}

export interface SavedProductsGroupedResponse {
  grouped_products: Record<string, SavedProductResponse[]>;
}

export async function createDesign(payload: CreateDesignRequest): Promise<ApiResponse<DesignResponse>> {
  const response = await apiRequest<DesignResponse>('POST', '/designs', payload);
  if (!shouldUseMock(response)) return response;

  await mockDelay();
  return mockResponse({
    id: crypto.randomUUID(),
    session_id: payload.session_id,
    room_type: payload.room_type,
    style: payload.style,
    budget: payload.budget,
    layout_json: payload.layout_json,
    mood_board_url: payload.mood_board_url || null,
    created_at: new Date().toISOString(),
  }, 201);
}

export async function saveProduct(payload: SaveProductRequest): Promise<ApiResponse<SavedProductResponse>> {
  const response = await apiRequest<SavedProductResponse>('POST', '/products/save', payload);
  if (!shouldUseMock(response)) return response;

  await mockDelay();
  const saved = {
    id: crypto.randomUUID(),
    ...payload,
    image_url: payload.image_url || null,
    category: payload.category || null,
  };
  const current = JSON.parse(localStorage.getItem("mock_saved_products") || "[]") as SavedProductResponse[];
  localStorage.setItem("mock_saved_products", JSON.stringify([...current, saved]));
  return mockResponse(saved, 201);
}

export async function getSavedProducts(): Promise<ApiResponse<SavedProductsGroupedResponse>> {
  const response = await apiRequest<SavedProductsGroupedResponse>('GET', '/products/saved');
  if (!shouldUseMock(response)) return response;

  await mockDelay();
  const current = JSON.parse(localStorage.getItem("mock_saved_products") || "[]") as SavedProductResponse[];
  const grouped_products = current.reduce<Record<string, SavedProductResponse[]>>((groups, product) => {
    const key = product.category || "uncategorized";
    groups[key] = [...(groups[key] || []), product];
    return groups;
  }, {});
  return mockResponse({ grouped_products });
}

export async function removeSavedProduct(productId: string): Promise<ApiResponse<{ product_id: string; removed_count: number }>> {
  const response = await apiRequest<{ product_id: string; removed_count: number }>('DELETE', `/products/saved/${productId}`);
  if (!shouldUseMock(response)) return response;

  await mockDelay();
  const current = JSON.parse(localStorage.getItem("mock_saved_products") || "[]") as SavedProductResponse[];
  const next = current.filter((product) => product.product_id !== productId);
  localStorage.setItem("mock_saved_products", JSON.stringify(next));
  return mockResponse({ product_id: productId, removed_count: current.length - next.length });
}

/**
 * Utility: Store auth token
 */
export function setAuthToken(token: string): void {
  localStorage.setItem('auth_token', token);
}

/**
 * Utility: Clear auth token
 */
export function clearAuthToken(): void {
  localStorage.removeItem('auth_token');
}

/**
 * Utility: Get stored auth token
 */
export function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}

/**
 * Utility: Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}
