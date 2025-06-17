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

	return (
		<div className="min-h-screen flex flex-col justify-center items-center font-(family-name:--font-climate-crisis)">
			<GameCard lobbyId={lobbyId} session={session} />
		</div>
	);
}
