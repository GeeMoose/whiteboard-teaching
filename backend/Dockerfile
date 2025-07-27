FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Create animations directory
RUN mkdir -p /app/animations

# Copy application code
COPY . .

# Create static directory for file serving
RUN mkdir -p /app/static

# Expose port (can be overridden by DOCKER_EXPOSE_PORT env var)
EXPOSE ${DOCKER_EXPOSE_PORT:-8000}

# Command to run the application (uses environment variables from config)
CMD ["python", "-m", "app.main"]