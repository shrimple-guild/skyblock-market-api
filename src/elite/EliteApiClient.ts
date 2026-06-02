import memoize from "memoizee"
import type { EliteApiWeightProfileResponse } from "../types/EliteApiWeightResponse"

export class EliteApiClient {
	private static readonly TIMEOUT_MS = 10 * 1000
	private static readonly CACHE_TTL = 5 * 60 * 1000

	private readonly baseUrl: string

	public getWeight: (playerUuid: string, profileUuid: string) => Promise<EliteApiWeightProfileResponse>

	constructor(baseUrl: string = "https://api.elitebot.dev") {
		this.baseUrl = baseUrl

		this.getWeight = memoize(this.fetchWeight, {
			maxAge: EliteApiClient.CACHE_TTL
		})
	}

	private async fetchWeight(playerUuid: string, profileUuid: string): Promise<EliteApiWeightProfileResponse> {
		const url = new URL(`/weight/${playerUuid}/${profileUuid}`, this.baseUrl)

		const response = await fetch(url, {
			signal: AbortSignal.timeout(EliteApiClient.TIMEOUT_MS)
		})

		if (!response.ok) {
			throw new Error(`Failed to fetch Elite weight for ${playerUuid}: ${response.status} ${response.statusText}`)
		}

		return response.json()
	}
}