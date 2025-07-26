from typing import Optional, Dict, Any, List
import asyncio
import openai
import anthropic
import google.generativeai as genai

from app.core.config import settings


class LLMService:
    def __init__(self):
        self.providers = []
        self.current_provider = None
        
        if settings.OPENAI_API_KEY:
            self.providers.append("openai")
            openai.api_key = settings.OPENAI_API_KEY
        
        if settings.ANTHROPIC_API_KEY:
            self.providers.append("anthropic")
            self.anthropic_client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
        
        if settings.GOOGLE_API_KEY:
            self.providers.append("google")
            genai.configure(api_key=settings.GOOGLE_API_KEY)
        
        if not self.providers:
            raise ValueError("No LLM API keys configured")
    
    async def generate_explanation(self, question: str, provider: Optional[str] = None) -> str:
        if provider and provider in self.providers:
            return await self._generate_with_provider(question, provider)
        
        for provider in self.providers:
            try:
                return await self._generate_with_provider(question, provider)
            except Exception as e:
                print(f"Provider {provider} failed: {e}")
                continue
        
        raise Exception("All LLM providers failed")
    
    async def _generate_with_provider(self, question: str, provider: str) -> str:
        self.current_provider = provider
        
        prompt = f"""You are an expert educational AI that creates clear, engaging explanations for whiteboard teaching.

Question: {question}

Please provide a comprehensive explanation that would be suitable for whiteboard teaching. The explanation should:
1. Start with a clear, simple definition or overview
2. Break down complex concepts into digestible steps
3. Use analogies and examples where helpful
4. Highlight key points and relationships
5. Be structured in a way that builds understanding progressively

Focus on creating content that would work well with visual animations and whiteboard illustrations."""

        if provider == "openai":
            response = await openai.ChatCompletion.acreate(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=1500
            )
            return response.choices[0].message.content
        
        elif provider == "anthropic":
            response = await self.anthropic_client.messages.create(
                model="claude-3-sonnet-20240229",
                max_tokens=1500,
                temperature=0.7,
                messages=[{"role": "user", "content": prompt}]
            )
            return response.content[0].text
        
        elif provider == "google":
            model = genai.GenerativeModel('gemini-pro')
            response = await model.generate_content_async(prompt)
            return response.text
        
        else:
            raise ValueError(f"Unknown provider: {provider}")
    
    async def generate_animation_script(self, explanation: str, animation_type: str) -> str:
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

        try:
            return await self._generate_with_provider(prompt, self.current_provider or self.providers[0])
        except Exception:
            return await self.generate_explanation(prompt)