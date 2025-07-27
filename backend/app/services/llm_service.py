from typing import Optional, Dict, Any, List
import asyncio
import httpx
import json

from app.core.config import settings


class LLMService:
    def __init__(self):
        if not settings.UNIFIED_LLM_API_KEY:
            raise ValueError("UNIFIED_LLM_API_KEY is not configured")
        
        self.api_key = settings.UNIFIED_LLM_API_KEY
        self.base_url = settings.UNIFIED_LLM_BASE_URL
        self.default_model = settings.UNIFIED_LLM_DEFAULT_MODEL
        self.current_provider = "unified"
        
        # HTTP client for async requests
        self.client = httpx.AsyncClient(
            timeout=httpx.Timeout(settings.LLM_TIMEOUT),
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
        )
    
    async def generate_explanation(self, question: str, model: Optional[str] = None) -> str:
        """Generate an educational explanation using the unified LLM API."""
        
        prompt = f"""You are an expert educational AI that creates clear, engaging explanations for whiteboard teaching.

Question: {question}

Please provide a comprehensive explanation that would be suitable for whiteboard teaching. The explanation should:
1. Start with a clear, simple definition or overview
2. Break down complex concepts into digestible steps
3. Use analogies and examples where helpful
4. Highlight key points and relationships
5. Be structured in a way that builds understanding progressively

Focus on creating content that would work well with visual animations and whiteboard illustrations."""

        return await self._call_unified_api(prompt, model or self.default_model)
    
    async def _call_unified_api(self, prompt: str, model: str, temperature: Optional[float] = None, max_tokens: Optional[int] = None) -> str:
        """Make a call to the unified LLM API using OpenAI-compatible format."""
        
        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": settings.LLM_SYSTEM_MESSAGE},
                {"role": "user", "content": prompt}
            ],
            "temperature": temperature or settings.LLM_TEMPERATURE,
            "max_tokens": max_tokens or settings.LLM_MAX_TOKENS,
            "stream": False
        }
        
        try:
            response = await self.client.post(
                f"{self.base_url}/chat/completions",
                json=payload
            )
            response.raise_for_status()
            
            data = response.json()
            
            if "choices" not in data or not data["choices"]:
                raise Exception("Invalid response format: no choices found")
            
            return data["choices"][0]["message"]["content"]
            
        except httpx.HTTPStatusError as e:
            raise Exception(f"HTTP error {e.response.status_code}: {e.response.text}")
        except httpx.RequestError as e:
            raise Exception(f"Request error: {str(e)}")
        except KeyError as e:
            raise Exception(f"Invalid response format: missing key {e}")
        except Exception as e:
            raise Exception(f"Unified LLM API call failed: {str(e)}")
    
    async def generate_animation_script(self, explanation: str, animation_type: str, model: Optional[str] = None) -> str:
        """Generate a Manim animation script using the unified LLM API."""
        
        prompt = f"""Based on the following explanation, generate a detailed Manim animation script that will create an engaging whiteboard-style educational animation.

Explanation: {explanation}
Animation Type: {animation_type}

Generate Python code using the Manim library that creates a step-by-step animated explanation. The animation should:
1. Use clear, readable text and diagrams
2. Animate text appearing progressively
3. Use visual elements like arrows, shapes, and colors to enhance understanding
4. Include smooth transitions between concepts
5. Be approximately 30-60 seconds long

Return only the Python Manim code, ready to execute."""

        return await self._call_unified_api(prompt, model or self.default_model)
    
    async def close(self):
        """Close the HTTP client connection."""
        await self.client.aclose()