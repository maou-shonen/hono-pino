# Hono + Pino

![NPM Version](https://img.shields.io/npm/v/hono-pino)
![npm bundle size](https://img.shields.io/bundlephobia/min/hono-pino)
[![codecov](https://codecov.io/github/maou-shonen/hono-pino/graph/badge.svg?token=FBGZOOXDTH)](https://codecov.io/github/maou-shonen/hono-pino)

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

todo  
[interface Options](https://github.com/maou-shonen/hono-pino/blob/main/src/types.ts#L11)
