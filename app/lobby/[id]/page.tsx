import { LobbyCard } from "@/components/lobby-card";
import { redis } from "@/lib/redis";
import { getSession, User } from "@/lib/session";

export default async function Lobby({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const lobbyId = (await params).id;

	const session = await getSession();

	if (!session) {
		return <div>no session</div>;
	}

	const players: User[] | null = await redis.hget(`lobby:${lobbyId}`, "players");

	if (!players) {
		return <div>no players</div>;
	}

	return (
		<div className="min-h-screen">
			<div className="max-w-6xl mx-auto px-8">
				<div className="h-screen flex flex-col justify-center items-center font-(family-name:--font-climate-crisis)">
					<div className="w-full text-3xl md:text-6xl mb-4">
						Lobby: {lobbyId}
					</div>
					<LobbyCard lobbyId={lobbyId} session={session} players={players} />
				</div>
			</div>
		</div>
	);
}
