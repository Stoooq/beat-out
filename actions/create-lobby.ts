"use server";

import { redis } from "@/lib/redis";
import { getSession, updateSession } from "@/lib/session";
import { redirect } from "next/navigation";

export const createLobby = async (id: string) => {
	const session = await getSession();

	if (!session?.googleTokens) return { error: "Not authenticated" };

	const lobby = {
		lobbyId: id,
		ownerId: session.userId,
		players: [],
		impostor: { playerId: "", track: "" },
		commonTrack: "",
		votes: [],
		gameOptions: { rounds: "", roundTime: "" },
		roundsLeft: "",
		currentRound: "",
		phase: "",
	};

	await redis.hset(`lobby:${lobby.lobbyId}`, {
		...lobby,
	});

	await updateSession({
		lobbyId: lobby.lobbyId,
	});

	redirect(`/lobby`);
};
