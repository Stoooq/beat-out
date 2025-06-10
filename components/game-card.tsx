"use client";

import { SessionPayload } from "@/lib/session";
import { useEffect, useState } from "react";
import { AudioPlayer } from "./audio-player";
import { useLobbyStore } from "@/state/lobbyStore";
import { useRouter } from "next/navigation";

export function GameCard({ session }: { session: SessionPayload }) {
	const router = useRouter()
	const { impostor, commonTrack, gameDuration } = useLobbyStore();
	console.log("Z GAME CARD", impostor?.track, commonTrack, impostor?.playerId);

	const [startCount, setStartCount] = useState(5);
	const [gameCount, setGameCount] = useState(gameDuration);

	const [isPlaying, setIsPlaying] = useState<boolean>(false);

	useEffect(() => {
		if (startCount <= 0) return;
		const timer = setTimeout(() => {
			setStartCount(startCount - 1);
		}, 1000);
		return () => clearTimeout(timer);
	}, [startCount]);

	useEffect(() => {
		if (!isPlaying) return
		if (gameCount <= 0) {
			router.push("/vote")
		};
		const timer = setTimeout(() => {
			setGameCount(gameCount - 1);
		}, 1000);
		return () => clearTimeout(timer);
	}, [gameCount, isPlaying]);

	if (!impostor?.track || !commonTrack) {
		return <div>No impostor</div>;
	}

	return (
		<div className="grid grid-cols-1 gap-[24px] w-full h-[1200px] md:h-[600px] p-[24px] bg-secondary-foreground rounded-[32px]">
			{gameCount}
			{startCount > 0 ? (
				<>
					<div className="text-6xl font-bold">Game starts in {startCount}</div>
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
						timeLeft={gameCount}
						setIsPlaying={setIsPlaying}
					/>
				</div>
			)}
		</div>
	);
}
