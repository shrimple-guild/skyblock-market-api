import type { ApiSkyblockBazaarResponse } from "../types/ApiSkyblockBazaarResponse"
import { Bazaar } from "../bazaar/Bazaar"
import type { ApiSkyblockItemsResponse, SkyblockItemJson } from "../types/SkyblockItemJson"
import { HypixelPlayer } from "./HypixelPlayer"
import type { ApiHypixelPlayerResponse } from "../types/ApiHypixelPlayerResponse"
import Keyv from "keyv"
import { UuidUtils } from "../utils/UuidUtils"
import { HypixelGuild } from "./HypixelGuild"
import type { ApiHypixelGuildResponse } from "../types/ApiHypixelGuildResponse"

type SearchParams = Record<string, string>

export class HypixelClient {
	private static readonly TIMEOUT_MS = 10 * 1000
	private static readonly PLAYER_CACHE_TTL = 5 * 60 * 1000
	private static readonly GUILD_CACHE_TTL = 60 * 60 * 1000

	private readonly baseUrl: string
	private readonly apiKey: string
	private readonly playerCache: Keyv<HypixelPlayer>
	private readonly guildIdCache: Keyv<string>
	private readonly guildCache: Keyv<HypixelGuild>

	constructor(baseUrl: string, apiKey: string) {
		this.baseUrl = baseUrl
		this.apiKey = apiKey
		this.playerCache = new Keyv()
		this.guildIdCache = new Keyv()
		this.guildCache = new Keyv()
	}

	public async getPlayer(query: string): Promise<HypixelPlayer> {
		const uuid = UuidUtils.compact(query)
		const cached = await this.playerCache.get(uuid)
		if (cached) return cached

		const player = await this.fetchPlayer(uuid)
		await this.playerCache.set(uuid, player, HypixelClient.PLAYER_CACHE_TTL)
		return player
	}

	private async fetchPlayer(uuid: string): Promise<HypixelPlayer> {
		const response = await this.fetchHypixel<ApiHypixelPlayerResponse>("/player", { uuid: uuid }, true)
		if (response.player == null) throw new Error(`This player has not joined Hypixel!`)
		return new HypixelPlayer(response.player)
	}

	public async getGuild(mode: "player" | "id" | "name", query: string): Promise<HypixelGuild> {
		const key = mode == "player" ? UuidUtils.compact(query) : query
		const guildIdTtl = mode == "player" ? HypixelClient.PLAYER_CACHE_TTL : HypixelClient.GUILD_CACHE_TTL

		const cacheKey = `${mode}:${key}`

		const cachedId = await this.guildIdCache.get(cacheKey)
		if (cachedId) {
			const cached = await this.guildCache.get(cachedId)
			if (cached) return cached
		}

		const guild = await this.fetchGuild(mode, query)
		await this.guildIdCache.set(cacheKey, guild.id, guildIdTtl)
		await this.guildCache.set(guild.id, guild, HypixelClient.GUILD_CACHE_TTL)

		return guild
	}

	private async fetchGuild(mode: "player" | "id" | "name", query: string): Promise<HypixelGuild> {
		const response = await this.fetchHypixel<ApiHypixelGuildResponse>("/guild", { [mode]: query }, true)
		if (response.guild == null) throw new Error(`No guild found.`)
		return new HypixelGuild(response.guild)
	}

	public async fetchBazaar(): Promise<Bazaar> {
		const response = await this.fetchHypixel<ApiSkyblockBazaarResponse>("/v2/skyblock/bazaar")
		return new Bazaar(response)
	}

	public async fetchItems(): Promise<SkyblockItemJson[]> {
		const response = await this.fetchHypixel<ApiSkyblockItemsResponse>("/v2/resources/skyblock/items")
		return response.items
	}

	private async fetchHypixel<T>(
		endpoint: string,
		params: SearchParams = {},
		authenticated: boolean = false
	): Promise<T> {
		const url = new URL(this.baseUrl)
		url.pathname = endpoint

		const searchParams = new URLSearchParams(params)
		if (authenticated) {
			searchParams.set("key", this.apiKey)
		}
		url.search = searchParams.toString()

		const response = await fetch(url, { signal: AbortSignal.timeout(HypixelClient.TIMEOUT_MS) })

		if (response.status !== 200) {
			const safeUrl = new URL(url.toString())

			if (authenticated) {
				const masked = this.apiKey.replace(/[0-9a-f]/gi, "*")
				safeUrl.searchParams.set("key", masked)
			}

			throw new Error(`Failed to fetch from ${safeUrl.toString()}, ${response.status} ${response.statusText}`)
		}
		return response.json()
	}
}
