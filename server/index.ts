import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { Server } from "socket.io";
import type { Server as HTTPServer } from "node:http";
import dotenv from "dotenv";
import Redis from "ioredis";
import { createAdapter } from "@socket.io/redis-adapter";
import { User } from "@/lib/session";

dotenv.config();

const PORT = parseInt(process.env.PORT || "3001");
// const HOST = process.env.HOST || "0.0.0.0";
// const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:8787";
const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;

if (!UPSTASH_REDIS_REST_URL) {
	console.error("Missing UPSTASH_REDIS_REST_URL environment variable");
	process.exit(1);
}

const redis = new Redis(UPSTASH_REDIS_REST_URL);

const pubClient = new Redis(UPSTASH_REDIS_REST_URL);
const subClient = pubClient.duplicate();

const app = new Hono();

const httpServer = serve({
	fetch: app.fetch,
	port: PORT,
});

const io = new Server(httpServer as HTTPServer, {
	cors: {
		origin: "*",
	},
	adapter: createAdapter(pubClient, subClient),
});

io.on("connection", async (socket) => {
	console.log("connected", socket.id);

	socket.on(
		"join-lobby",
		async (payload: { lobbyId: string; userId: string; userName: string }) => {
			// socket.join(payload.lobbyId)
			// socket.to(payload.lobbyId).emit("lobby-updated", { player: payload.userName })
			// socket.broadcast.emit("lobby-updated", { player: payload.userName })
			
			const { lobbyId, userId, userName } = payload;
			const newPlayer: User = { userId, userName };
			const key = `lobby:${lobbyId}`;
			
			console.log("user", userName,"joined lobby", lobbyId)

			const playersString = await redis.hget(key, "players");
			const players: User[] = playersString ? JSON.parse(playersString) : [];

			if (!players?.some((player) => player.userId === newPlayer.userId)) {
				players.push(newPlayer);
				await redis.hset(key, { players: JSON.stringify(players) });
			}

			socket.data.lobbyId = lobbyId;
			socket.data.user = newPlayer;

			socket.join(lobbyId);
			io.to(lobbyId).emit("lobby-updated", { lobbyId, players });
		}
	);

	socket.on(
		"leave-lobby",
		async (payload: { lobbyId: string; userId: string; userName: string }) => {
			const { lobbyId, userId, userName } = payload;
			const key = `lobby:${lobbyId}`;

			console.log("user", userName,"left lobby", lobbyId)

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

	socket.on("disconnect", async () => {
		console.log("disconected", socket.id);

		const { lobbyId, user } = socket.data as {
			lobbyId?: string;
			user?: User;
		};
		if (lobbyId && user) {
			socket.emit("leave-lobby", { lobbyId, userId: user.userId });
		}
	});
});

httpServer.on("listening", async () => {
	console.log(`Hono server listening on http://localhost:${PORT}`);
});
