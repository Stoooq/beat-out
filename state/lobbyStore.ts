import { create } from "zustand";

interface Player {
  userId: string;
  userName: string;
}

interface LobbyState {
  lobbyId: string | null;
  players: Player[];
  gameDuration: number;
  impostor?: {
    playerId: string;
    track: string;
  };
  commonTrack?: string;
  setLobby: (data: Partial<LobbyState>) => void;
  resetLobby: () => void;
}

export const useLobbyStore = create<LobbyState>((set) => ({
  lobbyId: null,
  players: [],
  gameDuration: 30,
  setLobby: (data) => set((state) => ({ ...state, ...data })),
  resetLobby: () =>
    set({
      lobbyId: null,
      players: [],
      impostor: undefined,
      commonTrack: undefined,
    }),
}));
