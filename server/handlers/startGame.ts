import { Redis } from "ioredis";
import type { Server, Socket } from "socket.io";
import { initializeRound } from "./round";

export function startGameHandler(io: Server, socket: Socket, redis: Redis) {
	socket.on(
		"start-game",
		async (payload: {
			lobbyId: string;
			access_token: string;
			gameOptions: { rounds: number; roundTime: number; playlistId: string };
		}) => {
			const { lobbyId, access_token, gameOptions } = payload;
			const key = `lobby:${lobbyId}`;

			await redis.hset(key, { gameOptions: JSON.stringify(gameOptions) });

			await initializeRound(
				io,
				lobbyId,
				redis,
				1,
				access_token,
				"game-started",
				gameOptions.playlistId
			);
		}
	);
}
