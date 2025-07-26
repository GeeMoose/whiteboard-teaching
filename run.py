#!/usr/bin/env python3

import subprocess
import sys
import os
import time
from pathlib import Path

def run_command(command, cwd=None):
    """Run a command and return the result"""
    try:
        result = subprocess.run(
            command, 
            shell=True, 
            cwd=cwd, 
            capture_output=True, 
            text=True
        )
        return result.returncode == 0, result.stdout, result.stderr
    except Exception as e:
        return False, "", str(e)

def check_dependencies():
    """Check if required dependencies are installed"""
    print("🔍 Checking dependencies...")
    
    # Check Python version
    if sys.version_info < (3, 9):
        print("❌ Python 3.9+ is required")
        return False
    
    # Check if Node.js is installed
    success, _, _ = run_command("node --version")
    if not success:
        print("❌ Node.js is not installed. Please install Node.js 16+")
        return False
    
    # Check if npm is installed
    success, _, _ = run_command("npm --version")
    if not success:
        print("❌ npm is not installed")
        return False
    
    print("✅ Dependencies check passed")
    return True

def setup_backend():
    """Set up the backend environment"""
    print("\n🔧 Setting up backend...")
    
    backend_dir = Path("backend")
    
    # Create virtual environment if it doesn't exist
    venv_dir = backend_dir / "venv"
    if not venv_dir.exists():
        print("Creating virtual environment...")
        success, _, error = run_command("python -m venv venv", cwd=backend_dir)
        if not success:
            print(f"❌ Failed to create virtual environment: {error}")
            return False
    
    # Determine the correct pip path
    if os.name == 'nt':  # Windows
        pip_path = venv_dir / "Scripts" / "pip"
        python_path = venv_dir / "Scripts" / "python"
    else:  # Unix-like
        pip_path = venv_dir / "bin" / "pip"
        python_path = venv_dir / "bin" / "python"
    
    # Install requirements
    print("Installing Python dependencies...")
    success, _, error = run_command(f"{pip_path} install -r requirements.txt", cwd=backend_dir)
    if not success:
        print(f"❌ Failed to install dependencies: {error}")
        return False
    
    # Create .env file if it doesn't exist
    env_file = Path(".env")
    if not env_file.exists():
        print("Creating .env file...")
        with open(".env.example", "r") as example_file:
            content = example_file.read()
        with open(".env", "w") as env_file:
            env_file.write(content)
        print("⚠️  Please edit .env file with your API keys")
    
    # Create animations directory
    animations_dir = Path("animations")
    animations_dir.mkdir(exist_ok=True)
    
    print("✅ Backend setup complete")
    return True

def setup_frontend():
    """Set up the frontend environment"""
    print("\n🔧 Setting up frontend...")
    
    frontend_dir = Path("frontend")
    
    # Install npm dependencies
    print("Installing npm dependencies...")
    success, _, error = run_command("npm install", cwd=frontend_dir)
    if not success:
        print(f"❌ Failed to install npm dependencies: {error}")
        return False
    
    print("✅ Frontend setup complete")
    return True

def start_backend():
    """Start the backend server"""
    print("\n🚀 Starting backend server...")
    
    backend_dir = Path("backend")
    venv_dir = backend_dir / "venv"
    
    if os.name == 'nt':  # Windows
        python_path = venv_dir / "Scripts" / "python"
    else:  # Unix-like
        python_path = venv_dir / "bin" / "python"
    
    # Start the backend server
    backend_process = subprocess.Popen(
        [str(python_path), "-m", "uvicorn", "app.main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"],
        cwd=backend_dir
    )
    
    return backend_process

def start_frontend():
    """Start the frontend development server"""
    print("\n🚀 Starting frontend server...")
    
    frontend_dir = Path("frontend")
    
    # Start the frontend server
    frontend_process = subprocess.Popen(
        ["npm", "start"],
        cwd=frontend_dir
    )
    
    return frontend_process

def main():
    """Main function to set up and run the application"""
    print("🎨 Whiteboard Teaching AI - Setup & Run")
    print("=" * 50)
    
    # Check dependencies
    if not check_dependencies():
        sys.exit(1)
    
    # Set up backend
    if not setup_backend():
        sys.exit(1)
    
    # Set up frontend
    if not setup_frontend():
        sys.exit(1)
    
    print("\n" + "=" * 50)
    print("🎉 Setup complete! Starting servers...")
    print("=" * 50)
    
    try:
        # Start backend
        backend_process = start_backend()
        time.sleep(3)  # Give backend time to start
        
        # Start frontend
        frontend_process = start_frontend()
        
        print("\n✅ Both servers are starting!")
        print("📍 Backend API: http://localhost:8000")
        print("📍 Frontend: http://localhost:3000")
        print("📍 API Docs: http://localhost:8000/docs")
        print("\n💡 Make sure to configure your API keys in the .env file")
        print("🔧 Press Ctrl+C to stop both servers")
        
        # Wait for processes
        backend_process.wait()
        frontend_process.wait()
        
    except KeyboardInterrupt:
        print("\n🛑 Shutting down servers...")
        backend_process.terminate()
        frontend_process.terminate()
        print("✅ Servers stopped")

if __name__ == "__main__":
    main()