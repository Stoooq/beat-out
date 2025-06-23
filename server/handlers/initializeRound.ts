import { Redis } from "ioredis";
import type { Server, Socket } from "socket.io";

export function initializeRoundHandler(
	io: Server,
	socket: Socket,
	redis: Redis
) {
	socket.on(
		"initialize-round",
		async (payload: {
			lobbyId: string;
			gameOptions: { rounds: number; roundTime: number; playlistId: string };
		}) => {
			const { lobbyId, gameOptions } = payload;
			const key = `lobby:${lobbyId}`;

			const currentRoundString = await redis.hget(key, "currentRound");
			const currentRound = currentRoundString
				? JSON.parse(currentRoundString)
				: "";

			if (currentRound >= gameOptions.rounds) {
				io.to(lobbyId).emit("game-ended");
				return;
			}

			io.to(lobbyId).emit("round-initialized");
		}
	);
}
