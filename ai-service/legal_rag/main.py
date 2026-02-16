from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.responses import StreamingResponse
from pipeline import analyze_case,analyze_case_stream
import time

app = FastAPI(title="Legal RAG API")

class QueryRequest(BaseModel):
    case_description: str


# Normal endpoint
@app.post("/analyze")
def analyze(request: QueryRequest):
    result = analyze_case(request.case_description)
    return result["analysis"]


# Streaming endpoint
# Streaming endpoint
@app.post("/analyze-stream")
def analyze_stream(request: QueryRequest):

    return StreamingResponse(
        analyze_case_stream(request.case_description),
        media_type="text/plain"
    )
