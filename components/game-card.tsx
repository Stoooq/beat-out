"use client";

import { SessionPayload } from "@/lib/session";
import { useEffect, useState } from "react";
import { AudioPlayer } from "./audio-player";
import { useLobbyStore } from "@/state/lobbyStore";

export function GameCard({ session }: { session: SessionPayload }) {
	const { impostor, commonTrack } = useLobbyStore();
	console.log("Z GAME CARD", impostor?.track, commonTrack, impostor?.playerId);

	const [count, setCount] = useState(5);

	useEffect(() => {
		if (count < 0) return;
		const timer = setTimeout(() => {
			setCount(count - 1);
		}, 1000);
		return () => clearTimeout(timer);
	}, [count]);

	if (!impostor?.track || !commonTrack) {
		return <div>No impostor</div>;
	}

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-[24px] w-full h-[1200px] md:h-[600px] p-[24px] bg-secondary-foreground rounded-[32px]">
			{count >= 0 ? (
				<div className="text-6xl font-bold">{count}</div>
			) : (
				<AudioPlayer
					videoId={
						session.userId === impostor.playerId ? impostor.track : commonTrack
					}
				/>
			)}
		</div>
	);
}
