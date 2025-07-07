import { Card, AuthStatus, LoginCredentials, CreateCardRequest, UpdateCardRequest } from './types';

// Dynamic API base URL that adapts to environment
const getApiBaseUrl = () => {
  // Check for explicit override first
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // In production (Docker), use relative URLs since nginx proxies for us
  if (process.env.NODE_ENV === 'production') {
    return '';
  }
  
  // In development, use the actual backend port
  return process.env.REACT_APP_API_URL || 'http://localhost:5001';
};

const API_BASE_URL = getApiBaseUrl();

// Log the API configuration for debugging
console.log(`🔗 API Base URL configured:`, API_BASE_URL || '(relative URLs - nginx proxy)');
console.log(`🌍 Environment:`, process.env.NODE_ENV);
if (process.env.REACT_APP_API_URL !== undefined) {
  console.log(`⚙️ Custom API URL:`, process.env.REACT_APP_API_URL);
}

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}/api${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Include cookies for session management
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Auth endpoints
  async login(credentials: LoginCredentials): Promise<AuthStatus> {
    const response = await this.request<{ message: string; user: { id: number; username: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    // Transform backend response to AuthStatus format
    return {
      authenticated: true,
      user: response.user
    };
  }

  async logout(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/logout', {
      method: 'POST',
    });
  }

  async getAuthStatus(): Promise<AuthStatus> {
    return this.request<AuthStatus>('/auth/status');
  }

  // Cards endpoints
  async getCards(): Promise<Card[]> {
    return this.request<Card[]>('/cards');
  }

  async getCard(id: number): Promise<Card> {
    return this.request<Card>(`/cards/${id}`);
  }

  async createCard(cardData: CreateCardRequest): Promise<Card> {
    const formData = new FormData();
    formData.append('title', cardData.title);
    if (cardData.subtitle) formData.append('subtitle', cardData.subtitle);
    if (cardData.description) formData.append('description', cardData.description);
    if (cardData.image) formData.append('image', cardData.image);

    return this.request<Card>('/cards', {
      method: 'POST',
      body: formData,
      headers: {}, // Remove Content-Type to let browser set multipart/form-data
    });
  }

  async updateCard(cardData: UpdateCardRequest): Promise<Card> {
    const formData = new FormData();
    formData.append('title', cardData.title);
    if (cardData.subtitle) formData.append('subtitle', cardData.subtitle);
    if (cardData.description) formData.append('description', cardData.description);
    if (cardData.image) formData.append('image', cardData.image);

    return this.request<Card>(`/cards/${cardData.id}`, {
      method: 'PUT',
      body: formData,
      headers: {}, // Remove Content-Type to let browser set multipart/form-data
    });
  }

  async deleteCard(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/cards/${id}`, {
      method: 'DELETE',
    });
  }

  // Helper method to get image URL
  getImageUrl(imagePath: string): string {
    return `${API_BASE_URL}/uploads/${imagePath}`;
  }
}

const apiService = new ApiService();
export default apiService; 