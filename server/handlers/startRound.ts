import { Redis } from "ioredis";
import type { Server, Socket } from "socket.io";
import { User } from "@/lib/session";
import { getYouTubeVideos } from "@/lib/getYouTubeVideos";
import { getLobbyQueue } from "../queues";

export function startRoundHandler(io: Server, socket: Socket, redis: Redis) {
	socket.on(
		"start-round",
		async (payload: {
			lobbyId: string;
			userId: string;
			access_token: string;
			gameOptions: { rounds: number; roundTime: number; playlistId: string };
		}) => {
			const { lobbyId, access_token, gameOptions } = payload;
			const key = `lobby:${lobbyId}`;
			const queue = getLobbyQueue(lobbyId);

			queue
				.add(async () => {
					const playersString = await redis.hget(key, "players");
					const players: User[] = playersString
						? JSON.parse(playersString)
						: [];

					const updatedPlayers = players.map((player) =>
						player.userId === payload.userId
							? { ...player, ready: true }
							: player
					);
					await redis.hset(key, "players", JSON.stringify(updatedPlayers));

					if (!updatedPlayers.every((player) => player.ready)) {
						return;
					}

					const currentRoundString = await redis.hget(key, "currentRound");
					const currentRound = currentRoundString
						? JSON.parse(currentRoundString)
						: "";

					const impostorPlayer =
						players[Math.floor(Math.random() * players.length)];

					const tracks = access_token
						? await getYouTubeVideos({
								access_token: access_token,
								playlistId: gameOptions.playlistId,
						  })
						: null;

					if (tracks) {
						const impostorTrackIndex = Math.floor(
							Math.random() * tracks.items.length
						);
						const impostorTrack =
							tracks.items[impostorTrackIndex].contentDetails.videoId;

						const remainingTracks = tracks.items.filter(
							(_, index) => index !== impostorTrackIndex
						);

						const commonTrackIndex = Math.floor(
							Math.random() * remainingTracks.length
						);
						const commonTrack =
							remainingTracks[commonTrackIndex].contentDetails.videoId;

						io.to(lobbyId).emit("role-reveal", {
							currentRound: currentRound,
							impostor: {
								playerId: impostorPlayer.userId,
								track: impostorTrack,
							},
							commonTrack: commonTrack,
						});

						setTimeout(async () => {
							await redis.hset(key, {
								votes: JSON.stringify([]),
								currentRound: currentRound,
								impostor: JSON.stringify({
									playerId: impostorPlayer.userId,
									track: impostorTrack,
								}),
								commonTrack: commonTrack,
								phase: "game",
							});

							io.to(lobbyId).emit("round-started", {
								currentRound: currentRound,
								impostor: {
									playerId: impostorPlayer.userId,
									track: impostorTrack,
								},
								commonTrack: commonTrack,
							});
						}, 5000);
					}
				})
				.catch((err) => {
					console.error("Error in queued start-round:", err);
				});
		}
	);
}
