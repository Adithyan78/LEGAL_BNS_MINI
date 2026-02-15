from fastapi import FastAPI
from pydantic import BaseModel
from pipeline import analyze_case

app = FastAPI(title="Legal RAG API")

class QueryRequest(BaseModel):
    case_description: str

@app.post("/analyze")
def analyze(request: QueryRequest):
    result = analyze_case(request.case_description)
    return result["analysis"]

