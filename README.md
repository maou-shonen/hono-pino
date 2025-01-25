# Hono + Pino

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]

<!-- [![JSR][jsr-version-src]][jsr-version-href]
[![JSR][jsr-score-src]][jsr-score-href] -->

[![bundle][bundle-src]][bundle-href]
[![Codecov][codecov-src]][codecov-href]
[![License][license-src]][license-href]

A [pino](https://github.com/pinojs/pino) logger plugin for [hono](https://github.com/honojs/hono)

This repository is inspired by [pino-http](https://github.com/pinojs/pino-http) and [nestjs-pino](https://github.com/iamolegga/nestjs-pino).

## Runtime Support

> [!IMPORTANT]
> This is fork of the original [hono-pino](https://github.com/maou-shonen/hono-pino) project that adds minimal output message option for cleaner logs

ex: with minimal enabled

```ts
return logger({
  pino: pino(
    {
      level: envVariables.LOG_LEVEL || "info",
    },
    envVariables.NODE_ENV === "production"
      ? undefined
      : pretty({
          colorize: true,
        }),
  ),
  http: {
    reqId: () => crypto.randomUUID(),
    minimalMessage: true,
  },
});
```

```sh
[10:37:26.771] INFO (223659): ✅  /api/v1/inventory GET  200 OK  application/json 29ms

```

With custom bindings

```ts
return logger({
  pino: pino(
    {
      level: envVariables.LOG_LEVEL || "info",
    },
    envVariables.NODE_ENV === "production"
      ? undefined
      : pretty({
          colorize: true,
        }),
  ),
  http: {
    reqId: () => crypto.randomUUID(),
    minimalMessage: (b, c) => {
      return {
        extra: "i want to log this too",
        ...b,
      };
    },
  },
});
```

```sh
[10:38:23.093] INFO (225266): Request completed
    extra: "i want to log this too"
    res: {
      "status": 200,
      "headers": {}
    }
    req: {
      "url": "/api/v1/inventory",
      "method": "GET",
      "headers": {

```

> [!IMPORTANT]
> This package uses pino, the pino is designed for Node.js and support browser environment,  
> for edge environments (e.g. Cloudflare Workers), some pino advanced features maybe not working,  
> if fixing these issues is feasible, I will make an effort to implement it, but I cannot guarantee this.

known issues:

- `transports`: Alternative -> browser.write

## Installation

```bash
# npm
npm install @tigawanna/hono-pino pino
# pnpm
pnpm add @tigawanna/hono-pino pino
# bun
bun add @tigawanna/hono-pino pino
```

## Usage

```ts
import { Hono } from 'hono'
import { pinoLogger } from '@tigawanna/hono-pino'

const app = new Hono()
  .use(
    pinoLogger({
      pino: {level: "debug"}
    }),
  )
  .get((c) => {
    const { logger } = c.var;

    const token = c.req.header("Authorization") ?? "";
    logger.debug({ token });

    const user = getAuthorizedUser(token);
    logger.assign({ user });

    const posts = getPosts();
    logger.assign({ posts });


    logger.setResMessage("Get posts success"); // optional

    return c.text("");
  });

await app.request("/", {
  headers: {
    Authorization: "Bearer token",
  },
});

// output (formatted for easier reading)
{"level":20, "token":"Bearer token"}
{
  "level": 30,
  "msg": "Get posts success",
  "user": {
    "id": 1,
    "name": "john"
  },
  "posts": [
    {
      "id": 1,
      "title": "My first post"
    },
    {
      "id": 2,
      "title": "My second post"
    }
  ],
  "req": {
    "headers": {
      "authorization": "Bearer token"
    },
    "method": "GET",
    "url": "/"
  },
  "reqId": 1,
  "res": {
    "headers": {},
    "status": 200
  },
  "responseTime": 2
}
```

## Example

see [examples](./examples/)

## Options & Types

[View the full options in JSR](https://jsr.io/@maou-shonen/@tigawanna/hono-pino/doc)  
[View the full options in github](./src/types.ts)

### Logger method

```ts
class PinoLogger {
  // Same as pino[logger level]
  trace: pino.LogFn
  debug: pino.LogFn
  info: pino.LogFn
  warn: pino.LogFn
  error: pino.LogFn
  fatal: pino.LogFn

  // Get bindings (object)
  bindings(): pino.Bindings
  // Reset bindings
  resetBindings(): void
  // Assign bindings (default shallow merge)
  assign(
    bindings: pino.Bindings
    opts?: {
      /** deep merge */
      deep?: boolean;
    },
  ): void
}
```

<!-- Refs -->

[npm-version-src]: https://img.shields.io/npm/v/@tigawanna/hono-pino
[npm-version-href]: https://npmjs.com/package/@tigawanna/hono-pino
[npm-downloads-src]: https://img.shields.io/npm/dm/@tigawanna/hono-pino
[npm-downloads-href]: https://npmjs.com/package/@tigawanna/hono-pino
[jsr-version-src]: https://jsr.io/badges/@maou-shonen/@tigawanna/hono-pino
[jsr-version-href]: https://jsr.io/@maou-shonen/@tigawanna/hono-pino
[codecov-src]: https://img.shields.io/codecov/c/gh/maou-shonen/@tigawanna/hono-pino/main
[jsr-score-src]: https://jsr.io/badges/@maou-shonen/@tigawanna/hono-pino/score
[jsr-score-href]: https://jsr.io/@maou-shonen/@tigawanna/hono-pino/score
[codecov-href]: https://codecov.io/gh/maou-shonen/@tigawanna/hono-pino
[bundle-src]: https://img.shields.io/bundlephobia/minzip/@tigawanna/hono-pino
[bundle-href]: https://bundlephobia.com/result?p=@tigawanna/hono-pino
[license-src]: https://img.shields.io/github/license/maou-shonen/@tigawanna/hono-pino.svg
[license-href]: https://github.com/maou-shonen/@tigawanna/hono-pino/blob/main/LICENSE
