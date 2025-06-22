import { Redis } from "ioredis";
import type { Server, Socket } from "socket.io";
import { initializeRound } from "./round";

export function startRoundHandler(io: Server, socket: Socket, redis: Redis) {
	socket.on(
		"start-round",
		async (payload: {
			lobbyId: string;
			access_token: string;
			gameOptions: { rounds: number; roundTime: number; playlistId: string };
		}) => {
			const { lobbyId, access_token, gameOptions } = payload;
			const key = `lobby:${lobbyId}`;

			const currentRoundString = await redis.hget(key, "currentRound");
			const currentRound = currentRoundString
				? JSON.parse(currentRoundString)
				: "";

			if (currentRound >= gameOptions.rounds) {
				return io.to(lobbyId).emit("game-ended");
			}

			await initializeRound(
				io,
				lobbyId,
				redis,
				currentRound + 1,
				access_token,
				"round-started",
				gameOptions.playlistId
			);
		}
	);
}
