# hono-pino

## [0.6.0](https://github.com/maou-shonen/hono-pino/compare/v0.5.1...v0.6.0) (2024-11-07)


### Features

* Do not use slow types ([#41](https://github.com/maou-shonen/hono-pino/issues/41)) ([77a2dbe](https://github.com/maou-shonen/hono-pino/commit/77a2dbe42520afc482a8f52602b2e62484c2b6a4))
* export type HttpLoggerOptions ([#51](https://github.com/maou-shonen/hono-pino/issues/51)) ([18ad33c](https://github.com/maou-shonen/hono-pino/commit/18ad33cedcb756d0d4a0472f5b816f30bb83288f))
* Publish to JSR ([#44](https://github.com/maou-shonen/hono-pino/issues/44)) ([9d392a6](https://github.com/maou-shonen/hono-pino/commit/9d392a615b39743c44624bf112096278835ac815))


### Bug Fixes

* pino.symbols is undefined in cloudflare workers ([#49](https://github.com/maou-shonen/hono-pino/issues/49)) ([61c6ab4](https://github.com/maou-shonen/hono-pino/commit/61c6ab4a80ff00db50e6936033e8a17409885f69))

## [0.5.1](https://github.com/maou-shonen/hono-pino/compare/v0.5.0...v0.5.1) (2024-11-03)


### Bug Fixes

* Fix incorrect structured logging by default ([#39](https://github.com/maou-shonen/hono-pino/issues/39)) ([7c77de8](https://github.com/maou-shonen/hono-pino/commit/7c77de805f89089be2573f8b11f6e2ff32d75ee0))

## [0.5.0](https://github.com/maou-shonen/hono-pino/compare/v0.4.0...v0.5.0) (2024-11-02)


### Features

* Do not use `slow types` ([#35](https://github.com/maou-shonen/hono-pino/issues/35)) ([9e4edbe](https://github.com/maou-shonen/hono-pino/commit/9e4edbedcdc7535aa1d205fff747fee5a0531c45))
* Response message can be overridden ([#27](https://github.com/maou-shonen/hono-pino/issues/27)) ([62d89d9](https://github.com/maou-shonen/hono-pino/commit/62d89d98a09e4819c90471b043a5db241bb85337))
* Use referRequestIdKey instead of the reqId option. ([#33](https://github.com/maou-shonen/hono-pino/issues/33)) ([efc9f07](https://github.com/maou-shonen/hono-pino/commit/efc9f078457244830da8c1b9631de8fa5d0d8a98))

## 0.4.0

### Minor Changes

- 79834f9: Enhanced bindings methods

### Patch Changes

- d83fbe8: Changed the middleware name to `pinoLogger`
- b34ea7a: Change internal `logger` to `_logger`

## 0.3.0

### Minor Changes

- ed9c781: Support using custom context key
- 63e6e36: Change deepmerge to defu

## 0.2.0

### Minor Changes

- ca773dc: Changing pino to peerDependencies
- ecaf049: Enhancing performance with prototype

## 0.1.1

### Patch Changes

- 4143bf2: Fix npm release

## 0.1.0

### Minor Changes

- 0e513a0: Release v0.1.0

  Start following semver from this version
