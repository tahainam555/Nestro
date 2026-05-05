/**
 * Centralized API Service Layer
 * Handles all backend communication for the Nestro application
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

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

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

    // Handle successful responses
    if (response.ok) {
      const data = await response.json();
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

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

    if (response.ok) {
      const data = await response.json();
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
  return response.success && response.data?.status === "ok";
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
  return apiRequest<AuthResponse>('POST', '/auth/register', payload, false);
}

export async function login(payload: LoginPayload): Promise<ApiResponse<AuthResponse>> {
  return apiRequest<AuthResponse>('POST', '/auth/login', payload, false);
}

export async function getCurrentUser(): Promise<ApiResponse<UserResponse>> {
  return apiRequest<UserResponse>('GET', '/auth/me');
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
  return apiRequest<CreateSessionResponse>('POST', '/sessions');
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

  return apiRequestMultipart<ChatResponse>('POST', '/chat/message', formData);
}

export async function getChatHistory(sessionId: string): Promise<ApiResponse<HistoryResponse>> {
  return apiRequest<HistoryResponse>('GET', `/chat/history?session_id=${sessionId}`);
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
  return apiRequest<DesignResponse>('POST', '/designs', payload);
}

export async function saveProduct(payload: SaveProductRequest): Promise<ApiResponse<SavedProductResponse>> {
  return apiRequest<SavedProductResponse>('POST', '/designs/products', payload);
}

export async function getSavedProducts(): Promise<ApiResponse<SavedProductsGroupedResponse>> {
  return apiRequest<SavedProductsGroupedResponse>('GET', '/designs/products');
}

export async function removeSavedProduct(productId: string): Promise<ApiResponse<{ product_id: string; removed_count: number }>> {
  return apiRequest('DELETE', `/designs/products/${productId}`);
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
