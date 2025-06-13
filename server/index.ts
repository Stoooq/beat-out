import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { Server } from "socket.io";
import type { Server as HTTPServer } from "node:http";
import dotenv from "dotenv";
import Redis from "ioredis";
import { createAdapter } from "@socket.io/redis-adapter";
import { User } from "@/lib/session";
import { getYouTubeVideos } from "@/lib/getYouTubeVideos";

dotenv.config();

const PORT = parseInt(process.env.PORT || "3001");
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

	setInterval(() => {
		socket.emit("ping", { message: "ping" });
	}, 30000);

	socket.on(
		"join-lobby",
		async (payload: { lobbyId: string; userId: string; userName: string }) => {
			const { lobbyId, userId, userName } = payload;
			const newPlayer: User = { userId, userName, points: 0 };
			const key = `lobby:${lobbyId}`;

			console.log("USER", userName, "JOINED LOBBY", lobbyId);

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

	socket.on(
		"start-game",
		async (payload: {
			lobbyId: string;
			gameOptions: { rounds: number; roundTime: number };
			access_token: string;
		}) => {
			const { lobbyId, gameOptions, access_token } = payload;
			const key = `lobby:${lobbyId}`;

			const roundsLeftString = await redis.hget(key, "roundsLeft");
			const roundsLeft = roundsLeftString ? JSON.parse(roundsLeftString) : gameOptions.rounds;

			if (roundsLeft <= 0) {
					console.log("coooooooos");
					io.to(lobbyId).emit("game-ended");
				}

			const allTracks = access_token
				? await getYouTubeVideos({
						access_token: access_token,
				  })
				: null;

			const playersString = await redis.hget(key, "players");
			const players: User[] = playersString ? JSON.parse(playersString) : [];

			const impostorIndex = Math.floor(Math.random() * players.length);
			const impostorId = players[impostorIndex].userId;

			if (allTracks) {
				const impostorTrackIndex = Math.floor(
					Math.random() * allTracks.items.length
				);
				const impostorTrack =
					allTracks.items[impostorTrackIndex].contentDetails.videoId;

				const remainingTracks = allTracks.items.filter(
					(_, index) => index !== impostorTrackIndex
				);
				const commonTrackIndex = Math.floor(
					Math.random() * remainingTracks.length
				);
				const commonTrack =
					remainingTracks[commonTrackIndex].contentDetails.videoId;

				const impostor = { playerId: impostorId, track: impostorTrack };

				console.log("ROUNDS LEFT", roundsLeft, roundsLeft - 1);

				await redis.hset(key, {
					votes: [],
					gameOptions: JSON.stringify(gameOptions),
					roundsLeft: roundsLeft - 1,
					impostor: JSON.stringify(impostor),
					commonTrack: commonTrack,
				});

				console.log("GAME STARTED IN LOBBY", lobbyId);

				io.to(lobbyId).emit("game-started", {
					impostorTrack,
					commonTrack,
					impostorId,
				});
			} else {
				console.log("Not enough tracks to start game");
				// io.to(lobbyId).emit("game-error", {
				// 	message: "Not enough tracks available",
				// });
			}
		}
	);

	socket.on(
		"cast-vote",
		async (payload: {
			lobbyId: string;
			impostorId: string;
			userId: string;
			votedUserId: string;
		}) => {
			const { lobbyId, impostorId, userId, votedUserId } = payload;
			const key = `lobby:${lobbyId}`;

			const playersString = await redis.hget(key, "players");
			const players: User[] = playersString ? JSON.parse(playersString) : [];

			const votesString = await redis.hget(key, "votes");
			const votes = votesString ? JSON.parse(votesString) : [];
			votes.push({ userId, votedUserId });

			await redis.hset(key, "votes", JSON.stringify(votes));

			console.log("USER", userId, "VOTED ON", votedUserId);

			if (votes.length >= players.length) {
				const votesForImpostor = votes.filter(
					(vote: { votedUserId: string }) => vote.votedUserId === impostorId
				).length;

				const updatedPlayers = players.map((player) => {
					if (player.userId === impostorId) {
						// Impostor gets points equal to number of players who didn't vote for him
						return {
							...player,
							points: player.points + (players.length - votesForImpostor),
						};
					} else {
						// Each player who voted for impostor gets one point
						const vote = votes.find(
							(v: { userId: string }) => v.userId === player.userId
						);
						if (vote && vote.votedUserId === impostorId) {
							return { ...player, points: player.points + 1 };
						}
						return player;
					}
				});
				await redis.hset(key, { players: JSON.stringify(updatedPlayers) });
				io.to(lobbyId).emit("voting-ended", { updatedPlayers });
			}
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
