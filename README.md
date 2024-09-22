# Hono + Pino

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![bundle][bundle-src]][bundle-href]
[![Codecov][codecov-src]][codecov-href]
[![License][license-src]][license-href]

A pino logger plugin for hono

The design references [pino-http](https://github.com/pinojs/pino-http) and [nestjs-pino](https://github.com/iamolegga/nestjs-pino).

## Install

```bash
# npm
npm install hono-pino pino
# pnpm
pnpm add hono-pino pino
# bun
bun add hono-pino pino
```

## Example

see [examples](./examples/)

## Configuration

[full options](./src/types.ts)

### Zero configuration

```ts
import { Hono } from "hono";
import { logger } from "hono-pino";

const app = new Hono();

app.use(logger());
```

### Configuration params

todo  
[interface Options](https://github.com/maou-shonen/hono-pino/blob/main/src/types.ts#L11)

<!-- Refs -->

[npm-version-src]: https://img.shields.io/npm/v/hono-pino
[npm-version-href]: https://npmjs.com/package/hono-pino
[npm-downloads-src]: https://img.shields.io/npm/dm/hono-pino
[npm-downloads-href]: https://npmjs.com/package/hono-pino
[codecov-src]: https://img.shields.io/codecov/c/gh/maou-shonen/hono-pino/main
[codecov-href]: https://codecov.io/gh/maou-shonen/hono-pino
[bundle-src]: https://img.shields.io/bundlephobia/minzip/hono-pino
[bundle-href]: https://bundlephobia.com/result?p=hono-pino
[license-src]: https://img.shields.io/github/license/maou-shonen/hono-pino.svg
[license-href]: https://github.com/maou-shonen/hono-pino/blob/main/LICENSE
