import { SocketContext } from "./SocketContext";
import { useContext } from "react";
export const useSocket = () => {
  return useContext(SocketContext);
};
