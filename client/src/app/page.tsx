"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Home() {
  const [roomId, setRoomId] = useState("");
  const router = useRouter();

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomId.trim()) {
      router.push(`/testpage/${roomId}`);
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        
        <div className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold mb-6 text-center">WebSocket Room Selector</h1>
          
          <form onSubmit={handleJoinRoom} className="flex flex-col gap-4">
            <div>
              <label htmlFor="roomId" className="block text-sm font-medium mb-1">
                Room ID
              </label>
              <input
                id="roomId"
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Enter a room name"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                required
              />
            </div>
            
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition-colors"
            >
              Join Room
            </button>
          </form>
          
          <div className="mt-6 text-sm">
            <p className="text-gray-600 dark:text-gray-300">
              Enter any room ID to create or join an existing room. 
              Share the same room ID with others to collaborate in real-time.
            </p>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h2 className="font-medium mb-2">Quick Join:</h2>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => router.push('/testpage/lobby')} 
                className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                lobby
              </button>
              <button 
                onClick={() => router.push('/testpage/test-room')} 
                className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                test-room
              </button>
              <button 
                onClick={() => router.push('/testpage/demo')} 
                className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                demo
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
