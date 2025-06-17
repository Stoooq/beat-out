"use client";

import { SessionPayload } from "@/lib/session";
import { getSocket } from "@/lib/socket";
import { useLobbyStore } from "@/state/lobbyStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function ResultsCard({
	lobbyId,
	session,
}: {
	lobbyId: string;
	session: SessionPayload;
}) {
	const socket = getSocket();
	const { players, setLobby, gameOptions } = useLobbyStore();

	const router = useRouter();

	const handleNextRound = () => {
		socket.emit("start-round", {
			lobbyId: lobbyId,
			access_token: session.googleTokens?.access_token,
			gameOptions: gameOptions,
		});
	};

	useEffect(() => {
		socket.on(
			"round-started",
			({
				currentRound,
				impostor,
				commonTrack,
			}: {
				currentRound: number,
				impostor: { playerId: string, track: string },
				commonTrack: string;
			}) => {
				setLobby({
					currentRound: currentRound,
					impostor: impostor,
					commonTrack: commonTrack,
				});
				router.push("/game");
			}
		);

		socket.on("game-ended", () => {
			setLobby({
				gameOptions: {
					rounds: 3,
					roundTime: 30,
				},
			});
			router.push("/lobby");
		});

		return () => {
			socket.off("game-started");
		};
	}, []);

	return (
		<div className="w-full h-[1200px] md:h-[600px] p-[24px] bg-secondary-foreground rounded-[32px]">
			Results
			{players.map((player) => (
				<div key={player.userId}>
					<div>{player.userName}</div>
					<div>{player.points}</div>
				</div>
			))}
			<button className="cursor-pointer p-4" onClick={handleNextRound}>
				Next round
			</button>
		</div>
	);
}
