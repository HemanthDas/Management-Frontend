import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "@tanstack/react-router";
import { useSocket } from "../context/useSocket";

interface Player {
  id: string;
  name: string;
  level: string;
}

interface LobbyState {
  name: string;
  level: string;
}
interface Spectators {
  name: string;
  socketId: string;
}
function Lobby() {
  const { roomId } = useParams({ from: "/lobby/$roomId" });
  const socket = useSocket();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { name, level } = (state || {}) as LobbyState; // Ensure state is properly set

  const [players, setPlayers] = useState<Player[]>([]);
  const [spectators, setSpectators] = useState<Spectators[]>([]);
  const [isHost, setIsHost] = useState(false);
  const [error, setError] = useState<string>("");

  const handleRoomUpdate = (room: {
    players: Player[];
    host: string;
    spectators: Spectators[];
  }) => {
    console.log("Room update received", room.host, room.players);
    setPlayers(room.players);
    setSpectators(room.spectators);
    setIsHost(room.host === name);
  };

  const handleError = (errorMessage: string) => {
    console.error("Error received from server:", errorMessage);
    setError(errorMessage);
  };

  useEffect(() => {
    if (!name || !level || !roomId) {
      navigate({ to: "/" });
      return;
    }

    socket.emit("check-room", roomId, (exists: boolean) => {
      if (!exists) {
        setError("Room does not exist");
      } else {
        socket.emit("join-room", { roomId, player: { name, level } });
      }
    });
    socket.emit("update-room", roomId);
    socket.on("room-update", handleRoomUpdate);
    socket.on("join-error", handleError);
    socket.on("remove-error", handleError);
    socket.on("start-error", handleError);

    return () => {
      socket.off("room-update", handleRoomUpdate);
      socket.off("join-error", handleError);
      socket.off("remove-error", handleError);
      socket.off("start-error", handleError);
    };
  }, [roomId, name, level, navigate]);

  const startGame = () => {
    if (isHost) {
      console.log(`Emitting start-game event for room ${roomId}`);
      socket.emit("start-game", roomId);
    } else {
      setError("Only the host can start the game.");
    }
  };

  const leaveRoom = () => {
    if (name) {
      socket.emit("remove-player", { roomId, name }, (isRemoved: boolean) => {
        if (!isRemoved) {
          setError("Failed to leave room. Please try again.");
          return;
        }
        navigate({ to: "/" });
      });
    } else {
      setError("Player name is not defined. Please reload and try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Lobby - Room {roomId}</h1>
      {error && (
        <div className="bg-red-500 text-white px-4 py-2 rounded mb-4">
          <p>{error}</p>
        </div>
      )}
      <div className="w-full max-w-md">
        <h2 className="text-xl font-semibold mb-2">Players</h2>
        <ul className="list-disc list-inside bg-gray-800 rounded-lg p-4 mb-4">
          {players.map((player) => (
            <li
              key={player.id}
              className="py-2 border-b border-gray-600 flex justify-between"
            >
              <span className="font-medium">{player.name}</span>
              <span className="text-yellow-400">{player.level}</span>
            </li>
          ))}
        </ul>
        <h2 className="text-xl font-semibold mb-2">Spectators</h2>
        <ul className="list-disc list-inside bg-gray-800 rounded-lg p-4">
          {spectators.map((spectator) => (
            <li
              key={spectator.name + "dd"}
              className="py-2 border-b border-gray-600"
            >
              {spectator.name}{" "}
              <span className="text-gray-400">(Spectator)</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex gap-4 mt-6">
        {isHost && (
          <button
            onClick={startGame}
            className="bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-700 transition-all"
          >
            Start Game
          </button>
        )}
        <button
          onClick={leaveRoom}
          className="bg-red-500 text-white px-6 py-2 rounded-full hover:bg-red-700 transition-all"
        >
          Leave Room
        </button>
      </div>
    </div>
  );
}

export default Lobby;
