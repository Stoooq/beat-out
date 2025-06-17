import { User } from "@/lib/session";
import { Redis } from "ioredis";
import type { Server, Socket } from "socket.io";

export function joinLobbyHandler(io: Server, socket: Socket, redis: Redis) {
	socket.on(
		"join-lobby",
		async (payload: { lobbyId: string; userId: string; userName: string }) => {
			const { lobbyId, userId, userName } = payload;
			const newPlayer: User = { userId, userName, points: 0 };
			const key = `lobby:${lobbyId}`;

			const playersString = await redis.hget(key, "players");
			const players: User[] = playersString ? JSON.parse(playersString) : [];

			if (!players?.some((player) => player.userId === newPlayer.userId)) {
				players.push(newPlayer);
				await redis.hset(key, { players: JSON.stringify(players) });
			}

			//todo socket.data.lobbyId = lobbyId; when user leave lobby (disconnect socket)
			//todo socket.data.user = newPlayer; when user leave lobby (disconnect socket)

			console.log("USER", userName, "JOINED LOBBY", lobbyId);

			socket.join(lobbyId);
			io.to(lobbyId).emit("lobby-updated", { lobbyId, players });
		}
	);
}
