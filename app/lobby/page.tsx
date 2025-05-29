import { LobbyCard } from "@/components/lobby-card";
import { getYouTubeVideos } from "@/lib/getYouTubeVideos";
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

	const videos = session.googleTokens
		? await getYouTubeVideos({
				access_token: session.googleTokens.access_token,
		  })
		: null;

	return (
		<div className="min-h-screen">
			<div className="max-w-6xl mx-auto px-8">
				<div className="min-h-screen flex flex-col justify-center items-center font-(family-name:--font-climate-crisis)">
					<div className="w-full text-3xl md:text-6xl mb-4">
						Lobby: {lobbyId}
					</div>
					<LobbyCard
						lobbyId={lobbyId}
						session={session}
						users={users}
						videos={videos}
					/>
				</div>
			</div>
		</div>
	);
}
