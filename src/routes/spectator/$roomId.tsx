import { useEffect, useState } from "react";

import { createFileRoute, useParams } from "@tanstack/react-router";
import { useSocket } from "../../context/useSocket";

export const Route = createFileRoute("/spectator/$roomId")({
  component: SpectatorView,
});
function SpectatorView() {
  const { roomId } = useParams({ from: "/spectator/$roomId" });
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const socket = useSocket();

  useEffect(() => {
    if (!socket) {
      setError("Socket connection is unavailable.");
      return;
    }
    socket.emit("update-room", roomId);
    socket.on("room-update", (room) => {
      console.log("Room update received", room.players);
      setPlayers(room.players || []);
      setLoading(false);
    });

    socket.on("join-error", (errMsg) => {
      setError(errMsg);
      setLoading(false);
    });

    return () => {
      socket.emit("leave-room", roomId);
      socket.off("room-update");
      socket.off("join-error");
    };
  }, [roomId, socket]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <h1 className="text-2xl font-bold">Loading Spectator View...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-red-100">
        <h1 className="text-xl font-bold text-red-600">Error</h1>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">
        Spectator View - Room {roomId}
      </h1>
      {players.length > 0 ? (
        <ul className="w-1/2 bg-white shadow rounded p-4">
          {players.map((player) => (
            <li
              key={player.id}
              className="py-2 px-4 border-b last:border-b-0 flex justify-between"
            >
              <span className="font-medium">{player.name}</span>
              <span className="text-gray-500">
                {player.isSpectator ? "Spectator" : `Level: ${player.level}`}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 text-lg">No players in the room yet.</p>
      )}
    </div>
  );
}
