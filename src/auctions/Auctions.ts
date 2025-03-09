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

	const bins = pages
		.flatMap((page) => page.auctions)
		.filter((auction) => auction.bin)
		.map((auction) => ({
			internalName: InternalName.resolveFromBytes(auction.item_bytes),
			lowestBin: auction.starting_bid
		}))

	return { timestamp: firstPage.lastUpdated, bins }
}

async function fetchPageAuctions(page: number): Promise<ApiSkyblockAuctionJson> {
	const response = await fetch(`${AUCTION_URL}?page=${page}`)
	return response.json() as Promise<ApiSkyblockAuctionJson>
}

export const Auctions = { fetchBins }
