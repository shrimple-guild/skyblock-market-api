import type Keyv from "keyv"

/**
 * Options for configuring the Mojang cache behavior.
 */
export type MojangClientOptions = {
	/** An Keyv instance to use for caching Mojang player data. Defaults to an in-memory store. */
	cache?: Keyv

	/** TTL in milliseconds for UUID lookups. Defaults to 5 minutes. */
	uuidTtl?: number

	/** TTL in milliseconds for name lookups. Defaults to 24 hours. */
	nameTtl?: number
}
