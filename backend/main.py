from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import List
import json

from analyzer import analyze_transcript, compare_transcripts

app = FastAPI(title="AI Workflow Evaluator")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/analyze")
async def analyze(files: List[UploadFile] = File(...)):
    results = []
    for f in files:
        content = (await f.read()).decode("utf-8", errors="ignore")
        result = await analyze_transcript(content, filename=f.filename)
        results.append(result)

    comparison = compare_transcripts(results) if len(results) > 1 else None

    return JSONResponse({"results": results, "comparison": comparison})
