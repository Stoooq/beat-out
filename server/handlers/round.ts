import type { Server } from "socket.io";
import { Redis } from "ioredis";
import { User } from "@/lib/session";
import { getYouTubeVideos } from "@/lib/getYouTubeVideos";

export async function initializeRound(
	io: Server,
	lobbyId: string,
	redis: Redis,
	currentRound: number,
	access_token: string,
	eventName: "game-started" | "round-started"
) {
	const key = `lobby:${lobbyId}`;

	const playersString = await redis.hget(key, "players");
	const players: User[] = playersString ? JSON.parse(playersString) : [];

	const impostorPlayer = players[Math.floor(Math.random() * players.length)];

	const tracks = access_token
		? await getYouTubeVideos({
				access_token: access_token,
		  })
		: null;

	if (tracks) {
		const impostorTrackIndex = Math.floor(Math.random() * tracks.items.length);
		const impostorTrack =
			tracks.items[impostorTrackIndex].contentDetails.videoId;

		const remainingTracks = tracks.items.filter(
			(_, index) => index !== impostorTrackIndex
		);

		const commonTrackIndex = Math.floor(Math.random() * remainingTracks.length);
		const commonTrack =
			remainingTracks[commonTrackIndex].contentDetails.videoId;

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

		io.to(lobbyId).emit(eventName, {
			currentRound: currentRound,
			impostor: { playerId: impostorPlayer.userId, track: impostorTrack },
			commonTrack: commonTrack,
		});
	}
}
