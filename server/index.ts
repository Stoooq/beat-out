import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { Server } from "socket.io";
import type { Server as HTTPServer } from "node:http";
import dotenv from "dotenv";
import Redis from "ioredis";
import { User } from "@/lib/session";
import { joinLobbyHandler } from "./handlers/joinLobby";
import { leaveLobbyHandler } from "./handlers/leaveLobby";
import { getCurrentStateHandler } from "./handlers/getCurrentState";
import { startGameHandler } from "./handlers/startGame";
import { startRoundHandler } from "./handlers/startRound";
import { castVoteHandler } from "./handlers/castVote";

dotenv.config();

const PORT = parseInt(process.env.PORT || "3001");
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

	setInterval(() => {
		socket.emit("ping", { message: "ping" });
	}, 30000);

	joinLobbyHandler(io, socket, redis);

	leaveLobbyHandler(io, socket, redis);

	getCurrentStateHandler(io, socket, redis);

	startGameHandler(io, socket, redis);

	startRoundHandler(io, socket, redis);

	castVoteHandler(io, socket, redis);

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
