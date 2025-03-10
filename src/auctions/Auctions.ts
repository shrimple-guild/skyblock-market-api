import { InternalName } from "../items/InternalName"
import type { ApiSkyblockAuctionJson } from "../types/ApiSkyblockAuctionJson"

export type Bin = {
	internalName: string
	lowestBin: number
}

const AUCTION_URL = "https://api.hypixel.net/v2/skyblock/auctions"

async function fetchBins(): Promise<{ timestamp: number; bins: Bin[] }> {
	const firstPage = await fetchPageAuctions(0)
	const pagePromises = Array.from({ length: firstPage.totalPages - 1 }, (_, p) => fetchPageAuctions(p + 1))
	const pages = await Promise.all([firstPage, ...pagePromises])

	if (!pages.every((page) => page.lastUpdated === firstPage.lastUpdated)) {
		throw new Error("Some pages had different timestamps.")
	}

	const lowestBinMap = new Map<string, number>()

	for (const page of pages) {
		for (const auction of page.auctions) {
			if (!auction.bin) continue
			const internalName = InternalName.resolveFromBytes(auction.item_bytes)
			const currentLowestBin = lowestBinMap.get(internalName) ?? Infinity
			lowestBinMap.set(internalName, Math.min(auction.starting_bid, currentLowestBin))
		}
	}

	const lowestBins: Bin[] = Array.from(lowestBinMap.entries(), (entry) => ({
		internalName: entry[0],
		lowestBin: entry[1]
	}))

	return { timestamp: firstPage.lastUpdated, bins: lowestBins }
}

async function fetchPageAuctions(page: number): Promise<ApiSkyblockAuctionJson> {
	const response = await fetch(`${AUCTION_URL}?page=${page}`)
	return response.json() as Promise<ApiSkyblockAuctionJson>
}

export const Auctions = { fetchBins }
