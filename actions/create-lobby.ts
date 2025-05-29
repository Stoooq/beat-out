"use server";

import { redis } from "@/lib/redis";
import { getSession, updateSessionWithLobbyId } from "@/lib/session";
import { redirect } from "next/navigation";

export const createLobby = async (id: string) => {
	const session = await getSession();

	if (!session?.googleTokens) return { error: "Not authenticated" };

	const lobby = {
		lobbyId: id,
		ownerId: session.userId,
		players: [],
	};

	await redis.hset(`lobby:${lobby.lobbyId}`, {
		...lobby,
	});

	await updateSessionWithLobbyId(id);

	redirect(`/lobby`);
};
