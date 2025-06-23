import { GameCard } from "@/components/game-card";
import { getSession } from "@/lib/session";

export default async function Game() {
	const session = await getSession();
	if (!session) {
		return <div>no session</div>;
	}

	const lobbyId = session?.lobbyId;
	if (!lobbyId) {
		return <div>no lobby</div>;
	}

	return <GameCard lobbyId={lobbyId} session={session} />;
}
