# Whiteboard Teaching AI

An AI-powered whiteboard teaching system that transforms questions into dynamic visual explanations and animations. Built with FastAPI backend and React frontend, inspired by Fogsight AI.

## Features

- 🤖 **AI-Powered Explanations**: Generate comprehensive explanations using multiple LLM providers (OpenAI, Anthropic, Google)
- 🎬 **Dynamic Animations**: Create educational whiteboard animations using Manim
- 💬 **Interactive Sessions**: Ask follow-up questions and build on previous explanations  
- 🎨 **Visual Learning**: Transform abstract concepts into engaging visual content
- 📚 **Session Management**: Organize and track your learning sessions
- 🔄 **Real-time Updates**: Live status updates as explanations and animations are generated

## Quick Start

### Prerequisites

- Python 3.9+
- Node.js 16+
- npm or yarn
- FFmpeg (for video processing)

### Easy Setup & Run

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd whiteboard-teaching
   ```

2. **Run the setup script**:
   ```bash
   python run.py
   ```

This script will:
- Check all dependencies
- Set up Python virtual environment
- Install backend dependencies
- Install frontend dependencies
- Create configuration files
- Start both servers

3. **Configure API Keys**:
   Edit the `.env` file with your API keys:
   ```bash
   OPENAI_API_KEY=your_openai_key_here
   ANTHROPIC_API_KEY=your_anthropic_key_here
   GOOGLE_API_KEY=your_google_key_here
   ```

4. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Manual Setup

#### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

#### Frontend Setup
```bash
cd frontend
npm install
npm start
```

### Docker Setup

```bash
docker-compose up --build
```

## Usage

1. **Ask a Question**: Start by asking any educational question on the home page
2. **Get Explanations**: The AI will generate a comprehensive explanation
3. **View Animations**: Watch as your explanation is transformed into a visual animation
4. **Ask Follow-ups**: Continue the conversation with related questions
5. **Manage Sessions**: Organize your learning into themed sessions

## Example Questions

- "Explain how photosynthesis works"
- "Show me how to solve quadratic equations"
- "What is machine learning and how does it work?"
- "Demonstrate the concept of recursion in programming"
- "Explain the water cycle with visual examples"

## Architecture

### Backend (FastAPI)
- **Models**: SQLAlchemy models for sessions, explanations, and animations
- **APIs**: RESTful endpoints for all operations
- **Services**: LLM integration and animation generation
- **Database**: SQLite (development) or PostgreSQL (production)

### Frontend (React + TypeScript)
- **Components**: Reusable UI components with styled-components
- **Pages**: Home page and session management
- **Services**: API integration and state management
- **Real-time**: Live updates for animation generation

### Animation System
- **Manim Integration**: Professional mathematical animations
- **AI-Generated Scripts**: LLM creates Manim code from explanations
- **Video Processing**: FFmpeg for video optimization
- **Thumbnail Generation**: Automatic preview images

## Configuration

### Environment Variables

```bash
# Database
DATABASE_URL=sqlite:///./whiteboard_teaching.db

# LLM APIs (at least one required)
OPENAI_API_KEY=your_key
ANTHROPIC_API_KEY=your_key  
GOOGLE_API_KEY=your_key

# Animation Settings
ANIMATION_OUTPUT_DIR=./animations
MAX_ANIMATION_DURATION=300

# Security
SECRET_KEY=your-secret-key
```

### LLM Provider Priority

The system tries providers in this order:
1. OpenAI GPT-4
2. Anthropic Claude
3. Google Gemini

## Development

### Project Structure
```
whiteboard-teaching/
├── backend/
│   ├── app/
│   │   ├── api/          # API endpoints
│   │   ├── models/       # Database models
│   │   ├── services/     # Business logic
│   │   ├── schemas/      # Pydantic schemas
│   │   └── core/         # Configuration
│   └── tests/
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   └── types/        # TypeScript types
│   └── public/
├── animations/           # Generated animation files
└── docs/
```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Troubleshooting

### Common Issues

1. **Animation Generation Fails**:
   - Ensure FFmpeg is installed
   - Check Manim installation
   - Verify animation output directory permissions

2. **LLM API Errors**:
   - Verify API keys in .env file
   - Check API quotas and billing
   - Ensure internet connectivity

3. **Database Issues**:
   - Check database URL configuration
   - Ensure database directory is writable
   - For PostgreSQL, verify connection settings

### Logs

- Backend logs: Check terminal running uvicorn
- Frontend logs: Check browser console
- Animation logs: Check backend logs for Manim output

## License

MIT License - see LICENSE file for details.

## Acknowledgments

- Inspired by [Fogsight AI](https://zread.ai/fogsightai/fogsight)
- Built with [Manim](https://www.manim.community/) for animations
- UI components styled with inspiration from modern design systems
