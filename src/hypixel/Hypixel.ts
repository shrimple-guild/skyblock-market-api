import type { ApiSkyblockBazaarResponse } from "../types/ApiSkyblockBazaarResponse"
import log4js from "log4js"
import { Environment } from "../Environment"
import { Bazaar } from "../bazaar/Bazaar"

const logger = log4js.getLogger("hypixel")
const baseUrl = "https://api.hypixel.net"

async function fetchBazaar(): Promise<Bazaar> {
	const bazaarResponse = await fetchHypixel<ApiSkyblockBazaarResponse>("/v2/skyblock/bazaar")
	return new Bazaar(bazaarResponse)
}

async function fetchHypixel<T>(endpoint: string, params: SearchParams = {}): Promise<T> {
	const url = new URL(baseUrl)
	url.pathname = endpoint
	url.search = new URLSearchParams(params).toString()
	const response = await fetch(url)
	if (response.status != 200) {
		throw new Error(`Failed to fetch from ${url.toString()}, ${response.status} ${response.statusText}`)
	}
	return response.json()
}

type SearchParams = Record<string, string>

export const Hypixel = {
	fetchBazaar
}
