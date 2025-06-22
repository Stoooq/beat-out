"use client";

import { SessionPayload } from "@/lib/session";
import { useEffect, useState } from "react";
import { AudioPlayer } from "./audio-player";
import { useLobbyStore } from "@/state/lobbyStore";
import { useRouter } from "next/navigation";
import { useCountdown } from "@/hooks/useCountdown";
import { getSocket } from "@/lib/socket";
import OverlayCard from "./overlay-card";

export function GameCard({
	lobbyId,
	session,
}: {
	lobbyId: string;
	session: SessionPayload;
}) {
	const socket = getSocket();

	const router = useRouter();
	const { impostor, commonTrack, gameOptions } = useLobbyStore();

	const startCountdown = useCountdown(1000, { autoStart: false });
	const gameCountdown = useCountdown(gameOptions.roundTime, {
		autoStart: false,
	});

	const [isPlaying, setIsPlaying] = useState<boolean>(false);

	useEffect(() => {
		socket.on(
			"role-reveal",
			({
				currentRound,
				impostor,
				commonTrack,
			}: {
				currentRound: number;
				impostor: { playerId: string; track: string };
				commonTrack: string;
			}) => {
				
			}
		);
	}, []);

	useEffect(() => {
		if (startCountdown.isFinished) {
			gameCountdown.start();
		}
	}, [startCountdown.remaining]);

	useEffect(() => {
		if (!isPlaying) return;
		if (gameCountdown.isFinished) {
			socket.emit("start-voting", {
				lobbyId: lobbyId,
			});
			router.push("/vote");
		}
	}, [gameCountdown.remaining, isPlaying]);

	if (!impostor?.track || !commonTrack) {
		return <div>No impostor</div>;
	}

	return (
		<OverlayCard className="rid grid-cols-1 gap-[24px]">
			{gameCountdown.remaining}
			{!startCountdown.isFinished ? (
				<>
					<div className="text-6xl font-bold">
						Game starts in {startCountdown.remaining}
					</div>
					<div>
						{impostor.playerId === session.userId
							? "You are impostor"
							: "Dance in beat"}
					</div>
				</>
			) : (
				<div className="w-full h-full bg-blue-200">
					<AudioPlayer
						videoId={
							session.userId === impostor.playerId
								? impostor.track
								: commonTrack
						}
						duration={gameOptions.roundTime}
						timeLeft={gameCountdown.remaining}
						setIsPlaying={setIsPlaying}
					/>
				</div>
			)}
		</OverlayCard>
	);
}
