import { ResultsCard } from "@/components/results-card";
import { redis } from "@/lib/redis";
import { getSession, User } from "@/lib/session";

export default async function Results() {
	const session = await getSession();
	if (!session) {
		return <div>no session</div>;
	}

	const lobbyId = session?.lobbyId;
	if (!lobbyId) {
		return <div>no lobby</div>;
	}

	const users: User[] | null = await redis.hget(`lobby:${lobbyId}`, "players");
	if (!users) {
		return <div>no players</div>;
	}

	return <ResultsCard lobbyId={lobbyId} session={session} />;
}
