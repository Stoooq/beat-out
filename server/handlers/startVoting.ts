import { Redis } from "ioredis";
import type { Server, Socket } from "socket.io";

export function startVotingHandler(io: Server, socket: Socket, redis: Redis) {
	socket.on(
		"start-voting",
		async (payload: {
			lobbyId: string;
		}) => {
			const { lobbyId } = payload;
			const key = `lobby:${lobbyId}`;

			// const phaseString = await redis.hget(key, "phase");
			// const phase = phaseString
			// 	? JSON.parse(phaseString)
			// 	: "";

            //todo make player synchronization

            await redis.hset(key, { phase: "vote" })
		}
	);
}
