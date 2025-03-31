import { Hono } from "hono";
import { handle } from "hono/vercel";
import fileRoute from "../_routes/file.route";
import paddleRoute from "../_routes/paddle.route";

export const runtime = "nodejs";

const app = new Hono().basePath("/api/v1");

app.route("/files", fileRoute);

app.route("/webhook", paddleRoute);

export const GET = handle(app);
export const POST = handle(app);
