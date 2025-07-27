from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import httpx
import asyncio
from typing import List
from fastapi import BackgroundTasks
import json
from fastapi.responses import StreamingResponse
from datetime import datetime
import random
import uuid
from typing import Dict


app = FastAPI(title="FastAPI Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "FastAPI Service is running!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/api/users")
async def get_users():
    return [
        {"id": 1, "name": "Alice", "email": "alice@example.com"},
        {"id": 2, "name": "Bob", "email": "bob@example.com"},
        {"id": 3, "name": "Charlie", "email": "charlie@example.com"}
    ]

@app.post("/api/users")
async def create_user(user: dict):
    return {"message": "User created", "user": user}

@app.get("/api/items/{item_id}")
async def get_item(item_id: int):
    return {"item_id": item_id, "name": f"Item {item_id}"}

@app.get("/api/scrape-multiple")
async def scrape_multiple_sites():
    urls = [
        "https://httpbin.org/delay/1",
        "https://httpbin.org/delay/2", 
        "https://httpbin.org/delay/1",
        "https://jsonplaceholder.typicode.com/posts/1",
        "https://jsonplaceholder.typicode.com/posts/2"
    ]
    
    async def fetch_url(client: httpx.AsyncClient, url: str):
        try:
            response = await client.get(url, timeout=10.0)
            return {"url": url, "status": response.status_code, "size": len(response.text)}
        except Exception as e:
            return {"url": url, "error": str(e)}
    
    async with httpx.AsyncClient() as client:
        # 동시에 모든 URL 요청
        tasks = [fetch_url(client, url) for url in urls]
        results = await asyncio.gather(*tasks)
    
    return {"results": results, "total_sites": len(urls)}

# 순차 처리와 비동기 처리 성능 비교
@app.get("/api/performance-test")
async def performance_test():
    import time
    
    urls = ["https://httpbin.org/delay/1" for _ in range(5)]
    
    # 순차 처리 (동기)
    start_sync = time.time()
    sync_results = []
    async with httpx.AsyncClient() as client:
        for url in urls:
            response = await client.get(url)
            sync_results.append(response.status_code)
    sync_time = time.time() - start_sync
    
    # 비동기 처리
    start_async = time.time()
    async with httpx.AsyncClient() as client:
        tasks = [client.get(url) for url in urls]
        async_responses = await asyncio.gather(*tasks)
        async_results = [r.status_code for r in async_responses]
    async_time = time.time() - start_async
    
    return {
        "sequential_time": round(sync_time, 2),
        "concurrent_time": round(async_time, 2),
        "speed_improvement": round(sync_time / async_time, 2),
        "urls_count": len(urls)
    }
    

@app.get("/api/logs/stream")
async def stream_logs():
    async def generate_logs():
        log_types = ["INFO", "WARNING", "ERROR", "DEBUG"]
        services = ["auth-service", "user-service", "order-service", "payment-service"]
        
        for i in range(100):  # 100개의 로그 생성
            log_entry = {
                "timestamp": datetime.now().isoformat(),
                "level": random.choice(log_types),
                "service": random.choice(services),
                "message": f"Log message {i}",
                "request_id": f"req-{random.randint(1000, 9999)}"
            }
            
            yield f"data: {json.dumps(log_entry)}\n\n"
            await asyncio.sleep(0.5)  # 0.5초마다 로그 생성
    
    return StreamingResponse(
        generate_logs(),
        media_type="text/plain",
        headers={"Cache-Control": "no-cache"}
    )
    
# 서버 상태 모니터링 스트림
@app.get("/api/monitoring/stream")
async def stream_monitoring():
    async def generate_metrics():
        for i in range(60):  # 1분간 모니터링
            metrics = {
                "timestamp": datetime.now().isoformat(),
                "cpu_usage": random.uniform(10, 90),
                "memory_usage": random.uniform(20, 80),
                "disk_usage": random.uniform(30, 70),
                "active_connections": random.randint(50, 200),
                "requests_per_minute": random.randint(100, 1000)
            }
            
            yield f"data: {json.dumps(metrics)}\n\n"
            await asyncio.sleep(1)  # 1초마다 메트릭 생성
    
    return StreamingResponse(
        generate_metrics(),
        media_type="text/plain",
        headers={"Cache-Control": "no-cache"}
    )

# 작업 상태 저장소 (실제로는 Redis나 DB 사용)
job_status: Dict[str, dict] = {}

# 무거운 백그라운드 작업 시뮬레이션
async def heavy_computation(job_id: str, data: dict):
    job_status[job_id] = {"status": "processing", "progress": 0}
    
    for i in range(10):
        # 실제 작업 시뮬레이션
        await asyncio.sleep(2)  # 2초씩 걸리는 작업
        progress = (i + 1) * 10
        job_status[job_id] = {
            "status": "processing", 
            "progress": progress,
            "message": f"Processing step {i+1}/10"
        }
    
    # 작업 완료
    job_status[job_id] = {
        "status": "completed", 
        "progress": 100,
        "result": f"Processed {len(data.get('items', []))} items",
        "message": "Task completed successfully"
    }

# 백그라운드 작업 시작
@app.post("/api/tasks/start")
async def start_background_task(data: dict, background_tasks: BackgroundTasks):
    job_id = str(uuid.uuid4())
    job_status[job_id] = {"status": "started", "progress": 0}
    
    background_tasks.add_task(heavy_computation, job_id, data)
    
    return {"job_id": job_id, "message": "Task started"}

# 작업 상태 확인
@app.get("/api/tasks/{job_id}/status")
async def get_task_status(job_id: str):
    if job_id not in job_status:
        return {"error": "Job not found"}
    
    return job_status[job_id]

# 모든 작업 목록
@app.get("/api/tasks")
async def list_all_tasks():
    return {"tasks": job_status}

# 여러 외부 API 동시 호출
@app.get("/api/external/dashboard")
async def get_dashboard_data():
    async def fetch_weather():
        # 실제로는 OpenWeatherMap API 등 사용
        await asyncio.sleep(1)  # API 호출 시뮬레이션
        return {"temperature": 22, "humidity": 65, "condition": "sunny"}
    
    async def fetch_news():
        # 실제로는 News API 사용
        await asyncio.sleep(1.5)
        return {
            "headlines": [
                "Tech News 1",
                "Tech News 2", 
                "Tech News 3"
            ]
        }
    
    async def fetch_stock_prices():
        # 실제로는 Alpha Vantage API 등 사용
        await asyncio.sleep(0.8)
        return {
            "AAPL": 150.25,
            "GOOGL": 2750.80,
            "TSLA": 245.67
        }
    
    async def fetch_crypto_prices():
        await asyncio.sleep(1.2)
        return {
            "BTC": 45000,
            "ETH": 3200,
            "ADA": 1.25
        }
    
    # 모든 API를 동시에 호출
    weather, news, stocks, crypto = await asyncio.gather(
        fetch_weather(),
        fetch_news(), 
        fetch_stock_prices(),
        fetch_crypto_prices()
    )
    
    return {
        "weather": weather,
        "news": news,
        "stocks": stocks,
        "crypto": crypto,
        "timestamp": datetime.now().isoformat()
    }
    
from fastapi import WebSocket, WebSocketDisconnect
from typing import List

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

@app.websocket("/ws/chat/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: int):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            message = f"Client #{client_id}: {data}"
            await manager.broadcast(message)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        await manager.broadcast(f"Client #{client_id} left the chat")

# 실시간 시스템 모니터링 웹소켓
@app.websocket("/ws/monitoring")
async def monitoring_websocket(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            # 시스템 메트릭 전송
            metrics = {
                "cpu": random.uniform(10, 90),
                "memory": random.uniform(20, 80),
                "timestamp": datetime.now().isoformat()
            }
            await websocket.send_text(json.dumps(metrics))
            await asyncio.sleep(1)
    except WebSocketDisconnect:
        pass
