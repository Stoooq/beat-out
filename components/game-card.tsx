"use client";

import { SessionPayload } from "@/lib/session";
import { useEffect, useState } from "react";
import { AudioPlayer } from "./audio-player";
import { useLobbyStore } from "@/state/lobbyStore";
import { useRouter } from "next/navigation";
import { useCountdown } from "@/hooks/useCountdown";
import { getSocket } from "@/lib/socket";
import OverlayCard from "./overlay-card";
import { motion } from "motion/react";

export function GameCard({
	lobbyId,
	session,
}: {
	lobbyId: string;
	session: SessionPayload;
}) {
	const socket = getSocket();

	const router = useRouter();
	const { impostor, commonTrack, gameOptions, setLobby } = useLobbyStore();

	const startCountdown = useCountdown(10, { autoStart: false });
	const gameCountdown = useCountdown(gameOptions.roundTime, {
		autoStart: false,
	});

	const [isPlaying, setIsPlaying] = useState<boolean>(false);
	const [showRole, setShowRole] = useState<boolean>(false);

	useEffect(() => {
		socket.emit("start-round", {
			lobbyId: lobbyId,
			userId: session.userId,
			access_token: session.googleTokens?.access_token,
			gameOptions: gameOptions,
		});
	}, []);

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
				setShowRole(true);
				setLobby({
					currentRound: currentRound,
					impostor: impostor,
					commonTrack: commonTrack,
				});
			}
		);

		socket.on("round-started", () => {
			setShowRole(false);
			startCountdown.start();
		});

		return () => {
			socket.off("role-reveal");
			socket.off("round-started");
		};
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

	// if (!impostor?.track || !commonTrack) {
	// 	return <div>No impostor</div>;
	// }

	return (
		<OverlayCard className="grid grid-cols-1 gap-[24px]">
			{!startCountdown.isFinished ? (
				<>
					{showRole ? (
						<div className="flex justify-center items-center h-full text-6xl">
							{impostor.playerId === session.userId
								? "Your role is Impostor"
								: "Your role is Crewmate"}
						</div>
					) : (
						<div className="flex justify-center items-center text-[150px] font-bold">
							<motion.div
								key={startCountdown.remaining}
								initial={{ opacity: 0.5, y: "-100%", scale: 0.5 }}
								animate={{
									opacity: [0.5, 1, 1, 0.5],
									y: ["-100%", "0", "0", "100%"],
									scale: [0.5, 1, 1, 0.5],
								}}
								transition={{ duration: 1, times: [0, 0.1, 0.95, 1] }}
							>
								{startCountdown.remaining}
							</motion.div>
						</div>
					)}
				</>
			) : (
				<div className="w-full h-full">
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
