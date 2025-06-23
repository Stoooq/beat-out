"use client";

import { SessionPayload } from "@/lib/session";
import { getSocket } from "@/lib/socket";
import { useLobbyStore } from "@/state/lobbyStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import OverlayCard from "./overlay-card";

export function ResultsCard({
	lobbyId,
	session,
}: {
	lobbyId: string;
	session: SessionPayload;
}) {
	const socket = getSocket();
	const { players, impostor, gameOptions } = useLobbyStore();

	const router = useRouter();

	const handleNextRound = () => {
		socket.emit("initialize-round", {
			lobbyId: lobbyId,
			gameOptions: gameOptions,
		});
	};

	useEffect(() => {
		socket.on("round-initialized", () => {
			router.push("/game");
		});

		socket.on("game-ended", () => {
			router.push("/lobby");
		});

		return () => {
			socket.off("game-started");
		};
	}, []);

	return (
		<OverlayCard className="relative grid grid-cols-1 md:grid-cols-2 gap-[32px]">
			<div>
				<div className="flex justify-center text-5xl md:text-6xl mb-[32px] md:mb-[64px]">
					Results
				</div>
				<div className="flex flex-col gap-[32px]">
					{players.map((player) => (
						<div key={player.userId} className="flex gap-2 h-10 md:h-16">
							<div className="h-full aspect-square rounded-full bg-[var(--bg-light)]"></div>
							<div className="flex justify-between items-center px-6 w-full rounded-full text-lg md:text-2xl bg-[var(--bg-light)] truncate">
								{player.userName}
							</div>
							<div className="flex justify-center items-center aspect-square text-2xl md:text-4xl">
								{player.points}
							</div>
						</div>
					))}
				</div>
			</div>
			<div className="flex flex-col gap-4">
				Impostor: {impostor.playerId}
				Song: {impostor.track}
				<button className="cursor-pointer p-4" onClick={handleNextRound}>
					Next round
				</button>
			</div>
		</OverlayCard>
	);
}
