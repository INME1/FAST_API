from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(
    title="FastAPI Service",
    description="FastAPI microservice for the fullstack app",
    version="1.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "FastAPI Service is running!",
        "version": "1.0.0",
        "environment": os.getenv("FASTAPI_ENV", "development")
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "fastapi"}

@app.get("/api/fastapi-data")
async def get_fastapi_data():
    return {
        "data": "This is from FastAPI",
        "items": [
            {"id": 1, "name": "FastAPI Item 1"},
            {"id": 2, "name": "FastAPI Item 2"},
            {"id": 3, "name": "FastAPI Item 3"},
        ]
    }
