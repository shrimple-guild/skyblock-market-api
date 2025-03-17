import type { ApiSkyblockBazaarResponse } from "../types/ApiSkyblockBazaarResponse"
import log4js from "log4js"
import type { ApiSkyblockProfile, ApiSkyblockProfilesJson } from "../types/ApiSkyblockProfilesResponse"
import { HypixelApiError } from "./HypixelApiError"
import { Environment } from "../Environment"
import { Bazaar } from "../bazaar/Bazaar"

const logger = log4js.getLogger("hypixel")
const baseUrl = "https://api.hypixel.net"

async function fetchBazaar(): Promise<Bazaar> {
	const bazaarResponse = await fetchHypixel<ApiSkyblockBazaarResponse>("/v2/skyblock/bazaar")
	return new Bazaar(bazaarResponse)
}

async function fetchSkyblockProfiles(uuid: string): Promise<ApiSkyblockProfile[]> {
	const response = await fetchAuthenticated<ApiSkyblockProfilesJson>("/v2/skyblock/profiles", { uuid: uuid })
	if (response.profiles == null) {
		throw new Error(`No profiles found for ${uuid}`)
	}
	return response.profiles
}

async function fetchAuthenticated<T>(endpoint: string, params: SearchParams = {}): Promise<T> {
	return fetchHypixel(endpoint, { ...params, key: Environment.HYPIXEL_API_KEY })
}

async function fetchHypixel<T>(endpoint: string, params: SearchParams = {}): Promise<T> {
	const url = new URL(baseUrl)
	url.pathname = endpoint
	url.search = new URLSearchParams(params).toString()
	const response = await fetch(url)
	if (response.status != 200) {
		const safeUrl = url.toString().replace(Environment.HYPIXEL_API_KEY, (key) => key.replace(/[^-]/g, "*"))
		throw new HypixelApiError(safeUrl, response)
	}
	return response.json()
}

type SearchParams = Record<string, string>

export const Hypixel = {
	fetchBazaar,
	fetchSkyblockProfiles
}
