import { User } from "@/lib/session";
import { Redis } from "ioredis";
import type { Server, Socket } from "socket.io";

export function leaveLobbyHandler(io: Server, socket: Socket, redis: Redis) {
	socket.on(
		"leave-lobby",
		async (payload: { lobbyId: string; userId: string; userName: string }) => {
			const { lobbyId, userId, userName } = payload;
			const key = `lobby:${lobbyId}`;

			console.log("USER", userName, "LEFT LOBBY", lobbyId);

			const playersString = await redis.hget(key, "players");
			const players: User[] = playersString ? JSON.parse(playersString) : [];

			const updatedPlayers = players.filter((p) => p.userId !== userId);

			await redis.hset(key, { players: JSON.stringify(updatedPlayers) });

			socket.leave(lobbyId);

			io.to(lobbyId).emit("lobby-updated", {
				lobbyId,
				players: updatedPlayers,
			});
		}
	);
}
