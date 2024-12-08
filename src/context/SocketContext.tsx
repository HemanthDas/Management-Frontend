import { createContext } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(io(import.meta.env.VITE_PROD_URL));

import { ReactNode } from "react";

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const socket = io(import.meta.env.VITE_PROD_URL);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export { SocketContext };
