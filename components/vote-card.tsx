"use client";

import { SessionPayload, User } from "@/lib/session";
import { getSocket } from "@/lib/socket";
import { useLobbyStore } from "@/state/lobbyStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import OverlayCard from "./overlay-card";

export function VoteCard({
	session,
	users,
}: {
	session: SessionPayload;
	users: User[];
}) {
	const socket = getSocket();
	const { impostor, setLobby } = useLobbyStore();

	const [votedFor, setVotedFor] = useState("");

	const router = useRouter();

	useEffect(() => {
		socket.on(
			"voting-ended",
			({ updatedPlayers }: { updatedPlayers: User[] }) => {
				setLobby({
					players: updatedPlayers,
				});
				router.push("/results");
			}
		);

		return () => {
			socket.off("voting-ended");
		};
	}, []);

	const handleVote = (playerId: string) => {
		setVotedFor(playerId);
		socket.emit("cast-vote", {
			lobbyId: session.lobbyId,
			impostorId: impostor?.playerId,
			userId: session.userId,
			votedUserId: playerId,
		});
	};

	return (
		<OverlayCard>
			<div className="text-6xl">Vote for suspicious</div>
			{users.map((user) => (
				<div key={user.userId} className="flex gap-2">
					<div className="h-16 min-w-16 rounded-full bg-[var(--bg-light)]"></div>
					<div className="flex justify-between items-center h-16 w-64 px-6 rounded-full text-2xl bg-[var(--bg-light)]">
						{user.userName}
					</div>
					{user.userId !== session.userId && (
						<button
							className={`flex justify-center items-center h-16 w-32 text-2xl rounded-full ${user.userId === votedFor ? "bg-[#9DBDB8]" : "cursor-pointer bg-[var(--bg)]"}`}
							onClick={() => handleVote(user.userId)}
						>
							Vote
						</button>
					)}
				</div>
			))}
		</OverlayCard>
	);
}
