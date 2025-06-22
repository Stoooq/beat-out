import type { Server, Socket } from "socket.io";

export function initializeRoundHandler(
	io: Server,
	socket: Socket,
) {
	socket.on("initialize-round", async (payload: { lobbyId: string }) => {
		const { lobbyId } = payload;

		//todo zrobić sprawdzenie ilości rund czy nie jest już koniec

		io.to(lobbyId).emit("round-initialized");
	});
}
