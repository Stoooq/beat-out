import { User } from "@/lib/session";
import { Redis } from "ioredis";
import type { Server, Socket } from "socket.io";

export function castVoteHandler(io: Server, socket: Socket, redis: Redis) {
    socket.on(
        "cast-vote",
        async (payload: {
            lobbyId: string;
            impostorId: string;
            userId: string;
            votedUserId: string;
        }) => {
            const { lobbyId, impostorId, userId, votedUserId } = payload;
            const key = `lobby:${lobbyId}`;

            const playersString = await redis.hget(key, "players");
            const players: User[] = playersString ? JSON.parse(playersString) : [];

            const votesString = await redis.hget(key, "votes");
            const votes = votesString ? JSON.parse(votesString) : [];

            const existingVoteIndex = votes.findIndex(
                (vote: { userId: string }) => vote.userId === userId
            );
            if (existingVoteIndex !== -1) {
                votes[existingVoteIndex].votedUserId = votedUserId;
            } else {
                votes.push({ userId, votedUserId });
            }

            await redis.hset(key, "votes", JSON.stringify(votes));

            console.log("USER", userId, "VOTED ON", votedUserId);

            if (votes.length >= players.length) {
                const votesForImpostor = votes.filter(
                    (vote: { votedUserId: string }) => vote.votedUserId === impostorId
                ).length;

                const updatedPlayers = players.map((player) => {
                    if (player.userId === impostorId) {
                        return {
                            ...player,
                            points: player.points + (players.length - votesForImpostor),
                        };
                    } else {
                        const vote = votes.find(
                            (v: { userId: string }) => v.userId === player.userId
                        );
                        if (vote && vote.votedUserId === impostorId) {
                            return { ...player, points: player.points + 1 };
                        }
                        return player;
                    }
                });
                await redis.hset(key, { players: JSON.stringify(updatedPlayers) });
                io.to(lobbyId).emit("voting-ended", { updatedPlayers });
            }
        }
    );
}