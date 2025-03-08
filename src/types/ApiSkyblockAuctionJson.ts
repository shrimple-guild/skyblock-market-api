export type ApiSkyblockAuctionJson = {
	success: true
	page: number
	totalPages: number
	totalAuctions: number
	lastUpdated: number
	auctions: ApiSkyblockAuction[]
}

export type ApiSkyblockAuction = {
	uuid: string
	auctioneer: string
	profile_id: string
	coop: string[]
	start: number
	end: number
	item_name: string
	item_lore: string
	extra: string
	category: string
	tier: string
	starting_bid: number
	item_bytes: string
	claimed: false
	claimed_bidders: []
	highest_bid_amount: number
	last_updated: number
	bin: boolean
	bids: ApiSkyblockAuctionBid
}

export type ApiSkyblockAuctionBid = {
	auction_id: number
	bidder: number
	profile_id: string
	amount: number
	timestamp: number
}
