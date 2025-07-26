export interface Session {
  id: number;
  session_id: string;
  title: string;
  description?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at?: string;
}

export interface SessionCreate {
  title: string;
  description?: string;
  metadata?: Record<string, any>;
}

export enum ExplanationStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed"
}

export interface Explanation {
  id: number;
  session_id: number;
  question: string;
  explanation_text?: string;
  status: ExplanationStatus;
  llm_provider?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at?: string;
}

export interface ExplanationCreate {
  session_id: string;
  question: string;
  metadata?: Record<string, any>;
}

export enum AnimationStatus {
  PENDING = "pending",
  GENERATING = "generating",
  COMPLETED = "completed",
  FAILED = "failed"
}

export enum AnimationType {
  MATHEMATICAL = "mathematical",
  CONCEPTUAL = "conceptual",
  PROCEDURAL = "procedural",
  INTERACTIVE = "interactive"
}

export interface Animation {
  id: number;
  explanation_id: number;
  title: string;
  description?: string;
  animation_type: AnimationType;
  status: AnimationStatus;
  file_path?: string;
  duration?: number;
  thumbnail_path?: string;
  manim_code?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at?: string;
}

export interface AnimationCreate {
  explanation_id: number;
  title: string;
  description?: string;
  animation_type: AnimationType;
  metadata?: Record<string, any>;
}