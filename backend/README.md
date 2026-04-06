# Backend

FastAPI backend that analyzes transcripts using Gemini.

## Setup

```bash
pip install -r requirements.txt
export GEMINI_API_KEY=your-key
uvicorn main:app --reload
```

## API

`POST /analyze` — accepts `multipart/form-data` with `files` field (1–10 `.txt`/`.md` files).

Returns:
```json
{
  "results": [...],
  "comparison": null
}
```
