import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { Server } from "socket.io";
import type { Server as HTTPServer } from "node:http";
import dotenv from "dotenv";
import Redis from "ioredis";

dotenv.config();

const PORT = parseInt(process.env.PORT || "3001");
// const HOST = process.env.HOST || "0.0.0.0";
// const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:8787";
const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;

if (!UPSTASH_REDIS_REST_URL) {
	console.error("Missing UPSTASH_REDIS_REST_URL environment variable");
	process.exit(1);
}

const publisher = new Redis(UPSTASH_REDIS_REST_URL);
const subscriber = new Redis(UPSTASH_REDIS_REST_URL);

const app = new Hono();

const httpServer = serve({
	fetch: app.fetch,
	port: PORT,
});

const io = new Server(httpServer as HTTPServer, {
	cors: {
		origin: "*",
	},
});

io.on("connection", async (socket) => {
	const incrResult = await publisher.incr("chat:connection-count");

	await publisher.publish("chat:connection-count-updated", String(incrResult));

    socket.on("chat:new-message", async ({ message }) => {
        await publisher.publish("chat:new-message", message.toString());
    })

	socket.on("disconnect", async () => {
		const decrResult = await publisher.decr("chat:connection-count");

		await publisher.publish(
			"chat:connection-count-updated",
			String(decrResult)
		);
	});
});

subscriber.subscribe("chat:connection-count-updated", (err, count) => {
	if (err) {
		console.error("Error subscribing to chat:connection-count-updated", err);
		return;
	}

	console.log("chat:connection-count-updated", count);
});

subscriber.subscribe("chat:new-message", (err, count) => {
    if (err) {
        console.error("Error subscribing to chat:new-message", err);
        return;
    }

    console.log("chat:new-message", count);
})

subscriber.on("message", (channel, message) => {
	if (channel === "chat:connection-count-updated") {
		io.emit("chat:connection-count-updated", {
			count: message,
		});
	}

    if (channel === "chat:new-message") {
        io.emit("chat:new-message", {
            message: message,
            id: Math.random().toString(36).substring(2, 15),
        });
    }
});

httpServer.on("listening", async () => {
	console.log(`Hono server listening on http://localhost:${PORT}`);

	const currentCount = await publisher.get("chat:connection-count");

	if (!currentCount) {
		await publisher.set("chat:connection-count", 0);
	}

	console.log(currentCount);
});
