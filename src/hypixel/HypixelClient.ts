import memoize from "memoizee"

import type { ApiSkyblockBazaarResponse } from "../types/ApiSkyblockBazaarResponse"
import { Bazaar } from "../bazaar/Bazaar"
import type { ApiSkyblockItemsResponse, SkyblockItemJson } from "../types/SkyblockItemJson"
import { HypixelPlayer } from "./HypixelPlayer"
import type { ApiHypixelPlayerResponse } from "../types/ApiHypixelPlayerResponse"
import { HypixelGuild } from "./HypixelGuild"
import type { ApiHypixelGuildResponse } from "../types/ApiHypixelGuildResponse"
import type { ApiSkyblockProfilesResponse } from "../types/ApiSkyblockProfilesResponse"
import { SkyblockProfiles } from "./skyblock/SkyblockProfiles"

export class HypixelClient {
	private static readonly TIMEOUT_MS = 10 * 1000
	private static readonly CACHE_TTL = 5 * 60 * 1000

	private readonly baseUrl: string
	private readonly apiKey: string

	public getPlayer: (uuid: string) => Promise<HypixelPlayer>
	public getGuild: (mode: string, query: string) => Promise<HypixelGuild>
	public getSkyblockProfiles: (uuid: string) => Promise<SkyblockProfiles>

	constructor(baseUrl: string, apiKey: string) {
		this.baseUrl = baseUrl
		this.apiKey = apiKey

		this.getPlayer = memoize(this.fetchPlayer, { maxAge: HypixelClient.CACHE_TTL })
		this.getGuild = memoize(this.fetchGuild, { maxAge: HypixelClient.CACHE_TTL })
		this.getSkyblockProfiles = memoize(this.fetchSkyblockProfiles, { maxAge: HypixelClient.CACHE_TTL })
	}

	public async fetchBazaar(): Promise<Bazaar> {
		const response = await this.fetchHypixel<ApiSkyblockBazaarResponse>("/v2/skyblock/bazaar")
		return new Bazaar(response)
	}

	public async fetchItems(): Promise<SkyblockItemJson[]> {
		const response = await this.fetchHypixel<ApiSkyblockItemsResponse>("/v2/resources/skyblock/items")
		return response.items
	}

	private async fetchSkyblockProfiles(uuid: string): Promise<SkyblockProfiles> {
		const response = await this.fetchHypixel<ApiSkyblockProfilesResponse>(
			"/v2/skyblock/profiles",
			{ uuid: uuid },
			true
		)
		if (response.profiles == null) throw new Error(`This player has not joined Skyblock!`)
		return new SkyblockProfiles(uuid, response.profiles)
	}

	private async fetchPlayer(uuid: string): Promise<HypixelPlayer> {
		const response = await this.fetchHypixel<ApiHypixelPlayerResponse>("/v2/player", { uuid: uuid }, true)
		if (response.player == null) throw new Error(`This player has not joined Hypixel!`)
		return new HypixelPlayer(response.player)
	}

	private async fetchGuild(mode: string, query: string): Promise<HypixelGuild> {
		const response = await this.fetchHypixel<ApiHypixelGuildResponse>("/v2/guild", { [mode]: query }, true)
		if (response.guild == null) throw new Error(`No guild found.`)
		return new HypixelGuild(response.guild)
	}

	private async fetchHypixel<T>(
		endpoint: string,
		params: Record<string, string> = {},
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

		if (response.status != 200) {
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
