import axios from 'axios';
import { 
  Session, 
  SessionCreate, 
  Explanation, 
  ExplanationCreate, 
  Animation, 
  AnimationCreate 
} from '../types/api';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export class ApiService {
  // Session endpoints
  static async createSession(data: SessionCreate): Promise<Session> {
    const response = await apiClient.post<Session>('/sessions/', data);
    return response.data;
  }

  static async getSessions(): Promise<Session[]> {
    const response = await apiClient.get<Session[]>('/sessions/');
    return response.data;
  }

  static async getSession(sessionId: string): Promise<Session> {
    const response = await apiClient.get<Session>(`/sessions/${sessionId}`);
    return response.data;
  }

  static async deleteSession(sessionId: string): Promise<void> {
    await apiClient.delete(`/sessions/${sessionId}`);
  }

  // Explanation endpoints
  static async createExplanation(data: ExplanationCreate): Promise<Explanation> {
    const response = await apiClient.post<Explanation>('/explanations/', data);
    return response.data;
  }

  static async getExplanations(sessionId?: string): Promise<Explanation[]> {
    const params = sessionId ? { session_id: sessionId } : {};
    const response = await apiClient.get<Explanation[]>('/explanations/', { params });
    return response.data;
  }

  static async getExplanation(explanationId: number): Promise<Explanation> {
    const response = await apiClient.get<Explanation>(`/explanations/${explanationId}`);
    return response.data;
  }

  // Animation endpoints
  static async createAnimation(data: AnimationCreate): Promise<Animation> {
    const response = await apiClient.post<Animation>('/animations/', data);
    return response.data;
  }

  static async getAnimations(explanationId?: number): Promise<Animation[]> {
    const params = explanationId ? { explanation_id: explanationId } : {};
    const response = await apiClient.get<Animation[]>('/animations/', { params });
    return response.data;
  }

  static async getAnimation(animationId: number): Promise<Animation> {
    const response = await apiClient.get<Animation>(`/animations/${animationId}`);
    return response.data;
  }

  static getAnimationFileUrl(animationId: number): string {
    return `${API_BASE_URL}/animations/${animationId}/file`;
  }

  static getAnimationThumbnailUrl(animationId: number): string {
    return `${API_BASE_URL}/animations/${animationId}/thumbnail`;
  }
}

export default ApiService;