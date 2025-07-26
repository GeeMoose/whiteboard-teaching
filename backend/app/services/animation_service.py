import os
import asyncio
import subprocess
from pathlib import Path
from typing import Tuple, Optional
import tempfile
import uuid

from app.core.config import settings
from app.services.llm_service import LLMService
from app.models.animation import AnimationType


class AnimationService:
    def __init__(self):
        self.output_dir = Path(settings.ANIMATION_OUTPUT_DIR)
        self.output_dir.mkdir(exist_ok=True)
        self.llm_service = LLMService()
    
    async def generate_animation(
        self, 
        title: str, 
        description: str, 
        animation_type: AnimationType
    ) -> Tuple[str, str, str, float]:
        animation_id = str(uuid.uuid4())
        
        explanation = f"Title: {title}\nDescription: {description}"
        manim_code = await self.llm_service.generate_animation_script(explanation, animation_type.value)
        
        manim_code = self._enhance_manim_code(manim_code, title)
        
        file_path = await self._render_animation(manim_code, animation_id)
        thumbnail_path = await self._generate_thumbnail(file_path, animation_id)
        duration = await self._get_video_duration(file_path)
        
        return file_path, thumbnail_path, manim_code, duration
    
    def _enhance_manim_code(self, manim_code: str, title: str) -> str:
        base_template = f'''from manim import *

class WhiteboardAnimation(Scene):
    def construct(self):
        # Set background color to white for whiteboard effect
        self.camera.background_color = WHITE
        
        # Title
        title = Text("{title}", color=BLACK, font_size=48)
        title.to_edge(UP)
        self.play(Write(title))
        self.wait(1)
        
        {self._extract_construct_body(manim_code)}
        
        # End with a brief pause
        self.wait(2)
'''
        return base_template
    
    def _extract_construct_body(self, manim_code: str) -> str:
        if "def construct(self):" in manim_code:
            lines = manim_code.split('\n')
            construct_start = -1
            for i, line in enumerate(lines):
                if "def construct(self):" in line:
                    construct_start = i + 1
                    break
            
            if construct_start != -1:
                construct_body = []
                indent_level = None
                for line in lines[construct_start:]:
                    if line.strip() == "":
                        construct_body.append(line)
                        continue
                    
                    current_indent = len(line) - len(line.lstrip())
                    if indent_level is None and line.strip():
                        indent_level = current_indent
                    
                    if line.strip() and current_indent < indent_level:
                        break
                    
                    construct_body.append(line[indent_level:] if indent_level else line)
                
                return '\n'.join(construct_body)
        
        return '''
        # Default animation content
        explanation = Text("Understanding the concept...", color=BLACK)
        explanation.scale(0.8)
        self.play(Write(explanation))
        self.wait(2)
        '''
    
    async def _render_animation(self, manim_code: str, animation_id: str) -> str:
        with tempfile.TemporaryDirectory() as temp_dir:
            script_path = os.path.join(temp_dir, f"animation_{animation_id}.py")
            
            with open(script_path, 'w') as f:
                f.write(manim_code)
            
            output_file = self.output_dir / f"animation_{animation_id}.mp4"
            
            cmd = [
                "manim",
                "-pql",  # Preview quality, low resolution for faster rendering
                "--media_dir", str(self.output_dir),
                script_path,
                "WhiteboardAnimation"
            ]
            
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            stdout, stderr = await process.communicate()
            
            if process.returncode != 0:
                raise Exception(f"Manim rendering failed: {stderr.decode()}")
            
            # Find the generated file (Manim creates files in subdirectories)
            for root, dirs, files in os.walk(self.output_dir):
                for file in files:
                    if file.endswith(".mp4") and "WhiteboardAnimation" in file:
                        source_path = os.path.join(root, file)
                        os.rename(source_path, str(output_file))
                        return str(output_file)
            
            raise Exception("Animation file not found after rendering")
    
    async def _generate_thumbnail(self, video_path: str, animation_id: str) -> str:
        thumbnail_path = self.output_dir / f"thumbnail_{animation_id}.png"
        
        cmd = [
            "ffmpeg",
            "-i", video_path,
            "-ss", "00:00:02",  # Take screenshot at 2 seconds
            "-vframes", "1",
            "-y",  # Overwrite existing file
            str(thumbnail_path)
        ]
        
        process = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        
        await process.communicate()
        
        if process.returncode != 0:
            # If ffmpeg fails, create a simple placeholder thumbnail
            from PIL import Image, ImageDraw, ImageFont
            
            img = Image.new('RGB', (1920, 1080), color='white')
            draw = ImageDraw.Draw(img)
            
            try:
                font = ImageFont.truetype("arial.ttf", 72)
            except:
                font = ImageFont.load_default()
            
            draw.text((960, 540), "Animation Thumbnail", fill='black', 
                     font=font, anchor='mm')
            
            img.save(thumbnail_path)
        
        return str(thumbnail_path)
    
    async def _get_video_duration(self, video_path: str) -> float:
        cmd = [
            "ffprobe",
            "-v", "quiet",
            "-show_entries", "format=duration",
            "-of", "csv=p=0",
            video_path
        ]
        
        try:
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            stdout, stderr = await process.communicate()
            
            if process.returncode == 0:
                duration_str = stdout.decode().strip()
                return float(duration_str)
        except:
            pass
        
        return 30.0  # Default duration if detection fails