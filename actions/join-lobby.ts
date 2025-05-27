"use server";

import { getSession, updateSessionWithLobbyId } from "@/lib/session";
import { redirect } from "next/navigation";

export const joinLobby = async (id: string) => {
	const session = await getSession();

	if (!session?.googleTokens) return { error: "Not authenticated" };

	await updateSessionWithLobbyId(id);

	redirect(`/lobby/${id}`);

	return { success: "Joined to lobby" };
};
