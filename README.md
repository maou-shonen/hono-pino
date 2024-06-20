# Hono + Pino

A pino logger plugin for hono

The design references [pino-http](https://github.com/pinojs/pino-http) and [nestjs-pino](https://github.com/iamolegga/nestjs-pino).

## Install

```bash
# npm
npm install hono-pino
# pnpm
pnpm add hono-pino
# bun
bun add hono-pino
```

## Example

see [examples](./examples/)

## Configuration

### Zero configuration

```ts
import { Hono } from "hono";
import { logger } from "hono-pino";

const app = Hono();

app.use(logger());
```

### Configuration params

todo [interface Options](./src/logger.ts)
