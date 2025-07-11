import { showRoutes } from "hono/dev";
import { createApp } from "honox/server";
import { pinoLogger } from "../../src";

const app = createApp();

app.use(pinoLogger());

showRoutes(app);

export default app;
