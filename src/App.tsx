import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useSocket } from "./context/useSocket";

const App = () => {
  const socket = useSocket();
  const [roomId, setRoomId] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [level, setLevel] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  const handleCreateRoom = () => {
    if (!name || !level) {
      alert("Please enter your name and level");
      return;
    }

    setIsLoading(true);
    const newRoomId = `room-${Math.random().toString(36).substring(2, 8)}`;

    socket.emit("create-room", { roomId: newRoomId, player: { name, level } });

    socket.on("room-update", (room) => {
      if (room) {
        setIsLoading(false);
        navigate({ to: `/lobby/${newRoomId}`, state: { name, level } });
      }
    });
    socket.on("join-error", (error) => {
      setIsLoading(false);
      alert(error);
    });
    socket.on("create-error", (error) => {
      setIsLoading(false);
      alert(error);
    });
  };
  const handleSpectateRoom = () => {
    if (!roomId.trim() || !name) {
      alert("Please fill all fields");
      return;
    }

    setIsLoading(true);

    socket.emit("join-room", {
      roomId,
      player: { name, isSpectator: true },
    });

    socket.on("room-update", (room) => {
      if (room) {
        setIsLoading(false);
        navigate({
          to: `/spectator/${roomId}`,
          state: { name, isSpectator: true },
        });
      }
    });

    socket.on("join-error", (error) => {
      setIsLoading(false);
      alert(error);
    });
  };

  const handleJoinRoom = () => {
    if (!roomId.trim() || !name || !level) {
      alert("Please fill all fields");
      return;
    }

    setIsLoading(true);
    socket.emit("join-room", { roomId, player: { name, level } });

    socket.on("room-update", (room) => {
      if (room) {
        setIsLoading(false);
        navigate({ to: `/lobby/${roomId}`, state: { name, level } });
      }
    });

    socket.on("join-error", (error) => {
      setIsLoading(false);
      alert(error);
    });
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Tournament Room Manager</h1>
      <div className="w-96">
        <h2 className="text-lg font-bold mb-2">Create Room</h2>
        <input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mb-2 p-2 w-full border rounded"
        />
        <input
          type="number"
          placeholder="Your Level"
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="mb-4 p-2 w-full border rounded"
        />
        <button
          onClick={handleCreateRoom}
          disabled={isLoading}
          className={`w-full px-4 py-2 rounded mb-6 ${
            isLoading
              ? "bg-gray-400"
              : "bg-green-500 text-white hover:bg-green-700"
          }`}
        >
          {isLoading ? "Creating..." : "Create Room"}
        </button>
      </div>

      <div className="w-96">
        <h2 className="text-lg font-bold mb-2">Join Room</h2>
        <input
          type="text"
          placeholder="Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          className="mb-2 p-2 w-full border rounded"
        />
        <input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mb-2 p-2 w-full border rounded"
        />
        <input
          type="number"
          placeholder="Your Level"
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="mb-4 p-2 w-full border rounded"
        />
        <button
          onClick={handleJoinRoom}
          disabled={isLoading}
          className={`w-full px-4 py-2 rounded ${
            isLoading
              ? "bg-gray-400"
              : "bg-blue-500 text-white hover:bg-blue-700"
          }`}
        >
          {isLoading ? "Joining..." : "Join Room"}
        </button>
        <button
          onClick={handleSpectateRoom}
          disabled={isLoading}
          className={`w-full px-4 py-2 rounded my-1 ${
            isLoading
              ? "bg-gray-400"
              : "bg-blue-500 text-white hover:bg-blue-700"
          }`}
        >
          {isLoading ? "starting Spectating..." : "Spectate Room"}
        </button>
      </div>
    </div>
  );
};

export default App;
