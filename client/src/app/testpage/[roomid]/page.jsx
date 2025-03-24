"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";

const WebSocketClient = () => {
    const params = useParams();
    const roomId = params.roomid;
    
    const [socket, setSocket] = useState(null);
    const [jsonData, setJsonData] = useState({});
    const [status, setStatus] = useState("disconnected"); // connected, connecting, disconnected, error
    const [errorMessage, setErrorMessage] = useState("");

    const connectWebSocket = useCallback(() => {
        setStatus("connecting");
        
        // Create new WebSocket connection to specific room
        const ws = new WebSocket(`ws://localhost:8000/ws/${roomId}`);
        
        ws.onopen = () => {
            console.log(`Connected to WebSocket room: ${roomId}`);
            setStatus("connected");
            setErrorMessage("");
        };
        
        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log(`Received data from room ${roomId}:`, data);
                setJsonData(data);
            } catch (error) {
                console.error("Failed to parse WebSocket message:", error);
            }
        };
        
        ws.onclose = (event) => {
            console.log(`WebSocket room ${roomId} disconnected`, event.code, event.reason);
            setStatus("disconnected");
            
            // Auto reconnect after 3 seconds
            setTimeout(() => {
                if (document.visibilityState === "visible") {
                    connectWebSocket();
                }
            }, 3000);
        };
        
        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
            setStatus("error");
            setErrorMessage("Connection failed. Server might be down.");
        };
        
        setSocket(ws);
        
        // Clean up on unmount
        return () => {
            if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
                ws.close();
            }
        };
    }, [roomId]);

    useEffect(() => {
        connectWebSocket();
        
        // Handle visibility change to reconnect when tab becomes visible
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible" && status !== "connected") {
                connectWebSocket();
            }
        };
        
        document.addEventListener("visibilitychange", handleVisibilityChange);
        
        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [connectWebSocket, status]);

    const sendJsonUpdate = () => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            const updatedData = { 
                name: "User" + Math.floor(Math.random() * 100), 
                age: Math.floor(Math.random() * 50),
                timestamp: new Date().toISOString(),
                room: roomId
            };
            socket.send(JSON.stringify(updatedData));
        } else {
            setErrorMessage("Cannot send: WebSocket is not connected");
            setTimeout(() => setErrorMessage(""), 3000);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4 p-6">
            <h1 className="text-2xl font-bold mb-2">WebSocket JSON Tracker</h1>
            <h2 className="text-xl text-blue-600 dark:text-blue-400 mb-4">Room: {roomId}</h2>
            
            <div className="w-full max-w-md mb-4">
                <div className={`px-3 py-2 rounded-md text-sm font-medium text-white
                    ${status === "connected" ? "bg-green-500" : 
                      status === "connecting" ? "bg-yellow-500" : 
                      status === "error" ? "bg-red-500" : "bg-gray-500"}`}>
                    Status: {status}
                </div>
                
                {errorMessage && (
                    <div className="mt-2 px-3 py-2 bg-red-100 border border-red-400 text-red-700 rounded">
                        {errorMessage}
                    </div>
                )}
            </div>
            
            <div className="w-full max-w-md mb-4">
                <h2 className="text-lg font-semibold mb-2">Current Room Data:</h2>
                <pre className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-auto max-h-80 w-full">
                    {Object.keys(jsonData).length > 0 
                        ? JSON.stringify(jsonData, null, 2) 
                        : "No data received yet for this room"}
                </pre>
            </div>
            
            <div className="flex gap-4">
                <button 
                    className={`px-4 py-2 rounded-lg text-white font-medium
                        ${status === "connected" 
                            ? "bg-blue-500 hover:bg-blue-600" 
                            : "bg-gray-400 cursor-not-allowed"}`}
                    onClick={sendJsonUpdate}
                    disabled={status !== "connected"}
                >
                    Send Random JSON Update
                </button>
                
                {status !== "connected" && (
                    <button 
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                        onClick={connectWebSocket}
                    >
                        Reconnect
                    </button>
                )}
            </div>
        </div>
    );
};

export default WebSocketClient;
