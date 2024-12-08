import { createFileRoute } from "@tanstack/react-router";
import Lobby from "../../components/Lobby";

export const Route = createFileRoute("/lobby/$roomId")({
  component: Lobby,
});