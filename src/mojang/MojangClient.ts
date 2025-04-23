import Keyv from "keyv"
import { UuidUtils } from "../utils/UuidUtils"
import type { MojangPlayer } from "./MojangPlayer"
import type { MojangClientOptions } from "./MojangClientOptions"

/**
 * A caching client for retrieving Minecraft player names and UUIDs.
 */
export class MojangClient {
	private cache: Keyv<MojangPlayer>
	private uuidTtl: number
	private nameTtl: number

	/**
	 * Creates an instance of MojangClient with optional caching.
	 *
	 * @param options - Configuration options for caching and TTL settings.
	 */
	constructor(options?: MojangClientOptions) {
		this.cache = options?.cache ?? new Keyv()
		this.uuidTtl = options?.uuidTtl ?? 5 * 60 * 1000
		this.nameTtl = options?.nameTtl ?? 24 * 60 * 60 * 1000
	}

	/**
	 * Retrieves Mojang player information based on the provided query.
	 * The query can be a UUID (optionally hyphenated) or a username.
	 *
	 * @param query - The UUID or username to search for.
	 * @returns A promise that resolves to a `MojangPlayer` or `null` if not found.
	 */
	async get(query: string): Promise<MojangPlayer | null> {
		if (UuidUtils.isValidUuid(query)) {
			return this.getByUuid(query)
		}

		if (this.isValidUsername(query)) {
			return this.getByName(query)
		}

		return null
	}

	private async getByName(name: string): Promise<MojangPlayer | null> {
		const nameKey = this.getNameKey(name)
		const cached = await this.cache.get(nameKey)
		if (cached) return cached

		const player = await this.fetchByName(name)
		if (!player) return null

		await this.cachePlayer(player)

		return player
	}

	private async getByUuid(uuid: string): Promise<MojangPlayer | null> {
		const uuidKey = this.getUuidKey(uuid)
		const cached = await this.cache.get(uuidKey)
		if (cached) return cached

		const player = await this.fetchByUuid(uuid)
		if (!player) return null

		await this.cachePlayer(player)

		return player
	}

	private async cachePlayer(player: MojangPlayer) {
		await Promise.all([
			this.cache.set(this.getUuidKey(player.uuid), player, this.uuidTtl),
			this.cache.set(this.getNameKey(player.name), player, this.nameTtl)
		])
	}

	private getUuidKey(uuid: string) {
		return `uuid:${UuidUtils.compact(uuid)}`
	}

	private getNameKey(name: string) {
		return `name:${name.toLowerCase()}`
	}

	private async fetchByName(username: string): Promise<MojangPlayer | null> {
		const response = await fetch(`https://api.mojang.com/users/profiles/minecraft/${username}`)
		if (response.status == 200) {
			const player = (await response.json()) as ApiMojangPlayer
			return { name: player.name, uuid: UuidUtils.standard(player.id) }
		} else if (response.status == 404) {
			return null
		} else {
			throw new Error(`Mojang API threw ${response.status} for username query "${username}"`)
		}
	}

	private async fetchByUuid(uuid: string): Promise<MojangPlayer | null> {
		const response = await fetch(`https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`)
		if (response.status == 200) {
			const player = (await response.json()) as ApiMojangPlayer
			return { name: player.name, uuid: UuidUtils.standard(player.id) }
		} else if (response.status == 204) {
			return null
		} else {
			throw new Error(`Mojang API threw ${response.status} for UUID query "${uuid}"`)
		}
	}

	private isValidUsername(username: string): boolean {
		return /^[a-zA-Z0-9_]{3,16}$/.test(username)
	}
}

interface ApiMojangPlayer {
	name: string
	id: string
}
