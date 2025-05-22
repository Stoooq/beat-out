"use client";

import { SessionPayload, User } from "@/lib/session";
import { useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

export function LobbyCard({
	lobbyId,
	session,
	players,
}: {
	lobbyId: string;
	session: SessionPayload;
	players: User[];
}) {
	useEffect(() => {
		if (!players.find((player) => player.userId === session.userId)) {
			console.log("cos")
		}
		socket.emit("join-lobby", {
			lobbyId: lobbyId,
			userId: session.userId,
			userName: session.userName,
		});

		socket.on("join-lobby", (userName: string) => {
			console.log(`User connected: ${userName}`);
		});

		return () => {
			socket.off("join-lobby");
		};
	}, []);

	return (
		<div className="flex w-full h-[600px] p-8 bg-foreground rounded-4xl text-background">
			<div className="w-[50%]">
				{players.map((player) => (
					<div key={player.userId}>{player.userName}</div>
				))}
			</div>
			<div className="w-[50%]">Settings</div>
		</div>
	);
}
