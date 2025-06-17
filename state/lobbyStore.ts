import { create } from "zustand";

interface Player {
	userId: string;
	userName: string;
	points: number;
}

interface LobbyState {
	lobbyId: string | null;
	players: Player[];
	gameOptions: {
		rounds: number;
		roundTime: number;
	};
	currentRound: number;
	impostor: {
		playerId: string;
		track: string;
	};
	commonTrack: string;
	setLobby: (data: Partial<LobbyState>) => void;
	resetLobby: () => void;
}

export const useLobbyStore = create<LobbyState>((set) => ({
	lobbyId: null,
	players: [],
	gameOptions: {
		rounds: 3,
		roundTime: 10,
	},
	currentRound: 0,
	impostor: {
		playerId: "",
		track: "",
	},
	commonTrack: "",
	setLobby: (data) => set((state) => ({ ...state, ...data })),
	resetLobby: () =>
		set({
			lobbyId: null,
			players: [],
			impostor: undefined,
			commonTrack: undefined,
		}),
}));
