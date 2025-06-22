import { LobbyCard } from "@/components/lobby-card";
import { getYouTubePlaylists } from "@/lib/getYouTubePlaylists";
import { redis } from "@/lib/redis";
import { getSession, User } from "@/lib/session";

export default async function Lobby() {
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

	const ownerId: string | null = await redis.hget(`lobby:${lobbyId}`, "ownerId");
	if (!ownerId) {
		return <div>no ownerId</div>
	}

	const playlists = session.googleTokens
		? await getYouTubePlaylists({
				access_token: session.googleTokens.access_token,
		  })
		: null;

	return (
		<div className="min-h-screen flex flex-col justify-center items-center font-(family-name:--font-climate-crisis)">
			<div className="w-full text-3xl md:text-6xl mb-4">Lobby: {lobbyId}</div>
			<LobbyCard
				lobbyId={lobbyId}
				ownerId={ownerId}
				session={session}
				users={users}
				playlists={playlists}
			/>
		</div>
	);
}
