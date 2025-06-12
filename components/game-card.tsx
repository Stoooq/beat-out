"use client";

import { SessionPayload } from "@/lib/session";
import { useEffect, useState } from "react";
import { AudioPlayer } from "./audio-player";
import { useLobbyStore } from "@/state/lobbyStore";
import { useRouter } from "next/navigation";
import { useCountdown } from "@/hooks/useCountdown";

export function GameCard({ session }: { session: SessionPayload }) {
	const router = useRouter();
	const { impostor, commonTrack, gameDuration } = useLobbyStore();

	const startCountdown = useCountdown(5);
	const gameCountdown = useCountdown(gameDuration, { autoStart: false });

	const [isPlaying, setIsPlaying] = useState<boolean>(false);

	useEffect(() => {
		if (startCountdown.isFinished) {
			gameCountdown.start();
		}
	}, [startCountdown.remaining]);

	useEffect(() => {
		if (!isPlaying) return;
		if (gameCountdown.isFinished) {
			router.push("/vote");
		}
	}, [gameCountdown.remaining, isPlaying]);

	if (!impostor?.track || !commonTrack) {
		return <div>No impostor</div>;
	}

	return (
		<div className="grid grid-cols-1 gap-[24px] w-full h-[1200px] md:h-[600px] p-[24px] bg-secondary-foreground rounded-[32px]">
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
						duration={gameDuration}
						timeLeft={gameCountdown.remaining}
						setIsPlaying={setIsPlaying}
					/>
				</div>
			)}
		</div>
	);
}
