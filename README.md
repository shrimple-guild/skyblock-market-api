# skyblock-market-api

A facade over the Hypixel, Mojang, and Elite APIs intended to provide services primarily for the guild bridge. The market services are tested and used in production. Breaking changes should not be made to these until changes are made to bridge accordingly. The Skyblock and Elite APIs are intended to be merged into a common layer and used as a backend for the bridge, but are not currently in use.

## Building

To install dependencies:

```bash
bun install
```

To run:

```bash
bun start
```

This project was created using `bun init` in bun v1.2.4. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

## Todos
- Figure out an actual, stable structure for the skyblock endpoints.
- Rework errors to properly report statuses - currently just throwing an error and elevating it upward until it gets caught as a 400.
- Probably refactor this - the bestiary and level resolvers are awkward, and only going to get worse. 
- Add player heads to the Mojang API: this would allow it to be a replacement for current bridge services.