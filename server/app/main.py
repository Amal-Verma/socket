from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import socket

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register WebSocket route without duplicate prefix
app.include_router(socket.router, tags=["WebSockets"])

@app.get("/")
def root():
    return {"message": "WebSocket API is running!"}
