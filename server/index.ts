import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { Server } from "socket.io";
import type { Server as HTTPServer } from "node:http";
import dotenv from "dotenv";
import Redis from "ioredis";
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

const app = new Hono();

const httpServer = serve({
	fetch: app.fetch,
	port: PORT,
});

const io = new Server(httpServer as HTTPServer, {
	cors: {
		origin: "*",
	},
});

io.on("connection", async (socket) => {
	console.log("connected", socket.id);

	socket.on(
		"join-lobby",
		async (payload: { lobbyId: string; userId: string; userName: string }) => {
			const { lobbyId, userId, userName } = payload;
			const newPlayer: User = { userId, userName };
			const key = `lobby:${lobbyId}`;

			const playersString = await redis.hget(key, "players");
			const players: User[] = playersString ? JSON.parse(playersString) : [];

			console.log(playersString, players);

			if (!players?.some((player) => player.userId === newPlayer.userId)) {
				players.push(newPlayer);
			}

			await redis.hset(key, { players: JSON.stringify(players) });

			// socket.join(lobbyId);
			// io.to(lobbyId).emit("lobby-updated", { lobbyId, players });
		}
	);

	socket.on("disconnect", async () => {
		console.log("disconected", socket.id);
	});
});

httpServer.on("listening", async () => {
	console.log(`Hono server listening on http://localhost:${PORT}`);
});
