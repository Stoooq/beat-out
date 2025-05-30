"use server";

import { getSession, updateSession } from "@/lib/session";
import { redirect } from "next/navigation";

export const joinLobby = async (id: string) => {
	const session = await getSession();

	if (!session?.googleTokens) return { error: "Not authenticated" };

	await updateSession({
		lobbyId: id,
	})

	redirect(`/lobby`);
};
