export default async function Lobby({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const lobbyId = parseInt((await params).id, 10);

	return <div>{lobbyId}</div>;
}
