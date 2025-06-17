import { Redis } from "ioredis";
import type { Server, Socket } from "socket.io";

export function getCurrentStateHandler(io: Server, socket: Socket, redis: Redis) {
	socket.on("get-current-state", async (payload: { lobbyId: string }) => {
		const { lobbyId } = payload;
		const key = `lobby:${lobbyId}`;
		const phase = await redis.hget(key, "phase");
		const currentRound = await redis.hget(key, "currentRound");

		io.to(lobbyId).emit("state-updated", {
			phase,
			currentRound: currentRound ? JSON.parse(currentRound) : null,
		});
	});
}
