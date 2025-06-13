import { GameCard } from "@/components/game-card";
import { getSession } from "@/lib/session";

export default async function Game() {
	const session = await getSession();
	if (!session) {
		return <div>no session</div>;
	}

	return (
		<div className="min-h-screen flex flex-col justify-center items-center font-(family-name:--font-climate-crisis)">
			<GameCard session={session} />
		</div>
	);
}
