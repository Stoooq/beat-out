"use client";

import { SessionPayload, User } from "@/lib/session";
import { getSocket } from "@/lib/socket";
import { useLobbyStore } from "@/state/lobbyStore";
import { useEffect } from "react";

export function VoteCard({
	session,
	users,
}: {
	session: SessionPayload;
	users: User[];
}) {
	const socket = getSocket();
	const { impostor } = useLobbyStore();

	useEffect(() => {
		socket.on(
			"voting-ended",
			({ updatedPlayers }: { updatedPlayers: User[] }) => {
                console.log(updatedPlayers)
            }
		);

		return () => {
			socket.off("voting-ended");
		};
	}, []);

	const handleVote = (playerId: string) => {
		console.log("vote on", playerId);
		socket.emit("cast-vote", {
			lobbyId: session.lobbyId,
			impostorId: impostor?.playerId,
			userId: session.userId,
			votedUserId: playerId,
		});
	};

	return (
		<div className="w-full h-[1200px] md:h-[600px] p-[24px] bg-secondary-foreground rounded-[32px]">
			Waiting for players to vote
			{users.map((user) => (
				<div key={user.userId} className="flex gap-8">
					<div>{user.userName}</div>
					<button
						className="cursor-pointer"
						onClick={() => handleVote(user.userId)}
					>
						{user.userId === session.userId ? "" : "vote"}
					</button>
				</div>
			))}
		</div>
	);
}
