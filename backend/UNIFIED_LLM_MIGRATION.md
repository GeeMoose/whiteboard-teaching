# Unified LLM API Migration Guide

This document outlines the migration from multiple LLM providers (OpenAI, Anthropic, Google) to a single unified LLM API endpoint.

## Overview

The whiteboard teaching application has been refactored to use a unified LLM API that provides an OpenAI-compatible interface. This simplifies configuration, reduces dependencies, and provides a consistent API experience.

## Changes Made

### 1. Configuration Updates

**Old Configuration (deprecated):**
```bash
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
GOOGLE_API_KEY=your-google-key
```

**New Configuration:**
```bash
UNIFIED_LLM_API_KEY=sk-8xyWm3U1v2O1DzQ24fD2158d4f4343Ec8fE4905e27518442
UNIFIED_LLM_BASE_URL=https://api.openai-next.com/v1
UNIFIED_LLM_DEFAULT_MODEL=gpt-4o-mini
```

### 2. Dependencies Removed

The following dependencies are no longer required:
- `openai==1.3.7`
- `anthropic==0.7.8`
- `google-generativeai==0.3.2`

The unified API uses `httpx` for HTTP requests, which was already included in the dependencies.

### 3. Service Layer Changes

**LLMService** (`app/services/llm_service.py`):
- Removed provider-specific initialization and client setup
- Added unified API client using httpx
- Simplified method signatures (model parameter instead of provider)
- Added proper async context management with `close()` method

**Key Method Changes:**
```python
# Old
await llm_service.generate_explanation(question, provider="openai")

# New
await llm_service.generate_explanation(question, model="gpt-4o-mini")
```

### 4. Error Handling Improvements

- Unified error handling for HTTP requests
- Better error messages with specific HTTP status codes
- Proper cleanup of HTTP connections

## API Compatibility

The unified API endpoint supports the OpenAI Chat Completions format:

```bash
curl https://api.openai-next.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-8xyWm3U1v2O1DzQ24fD2158d4f4343Ec8fE4905e27518442" \
  -d '{
    "model": "gpt-4o-mini",
    "stream": false,
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "Hello!"} 
    ]
  }'
```

## Model Selection

The unified API supports multiple models. You can specify different models when calling the service:

```python
# Use default model (configured in settings)
explanation = await llm_service.generate_explanation(question)

# Use specific model
explanation = await llm_service.generate_explanation(question, model="gpt-4")
```

## Migration Steps

1. **Update Environment Variables:**
   - Set `UNIFIED_LLM_API_KEY` to your unified API key
   - Set `UNIFIED_LLM_BASE_URL` to the API endpoint
   - Set `UNIFIED_LLM_DEFAULT_MODEL` to your preferred default model
   - Remove old provider-specific API keys (optional, for cleanup)

2. **Update Dependencies:**
   - The old provider dependencies are commented out in `requirements.txt`
   - Run `pip install -r requirements.txt` to update dependencies

3. **Test the Integration:**
   - Run the test script: `python test_unified_llm.py`
   - Verify that explanations and animation scripts generate correctly

4. **Deploy:**
   - Update your production environment variables
   - Deploy the updated application

## Rollback Plan

If you need to rollback to the old system:

1. Uncomment the old dependencies in `requirements.txt`
2. Restore the old `llm_service.py` from version control
3. Update environment variables back to provider-specific keys
4. Redeploy

## Testing

A test script (`test_unified_llm.py`) is provided to verify the integration:

```bash
cd backend
python test_unified_llm.py
```

This script tests:
- Service initialization
- Explanation generation
- Animation script generation
- Proper connection cleanup

## Benefits

1. **Simplified Configuration:** Single API key instead of multiple provider keys
2. **Reduced Dependencies:** Fewer third-party packages to manage
3. **Consistent API:** All requests use the same OpenAI-compatible format
4. **Better Error Handling:** Unified error handling across all requests
5. **Improved Performance:** Single HTTP client with connection pooling
6. **Model Flexibility:** Easy to switch between different models

## Support

For issues with the unified API endpoint, contact your API provider. For application-specific issues, check the logs and error handling in the `LLMService` class.