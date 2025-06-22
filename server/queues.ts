import PQueue from 'p-queue';

const queues = new Map<string, PQueue>();

export function getLobbyQueue(lobbyId: string) {
  if (!queues.has(lobbyId)) {
    queues.set(lobbyId, new PQueue({ concurrency: 1 }));
  }
  return queues.get(lobbyId)!;
}
