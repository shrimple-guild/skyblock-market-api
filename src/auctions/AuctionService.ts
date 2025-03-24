import fuzzysort from "fuzzysort"
import { type ItemName } from "../items/ItemNameResolver"
import { AuctionData } from "./AuctionData"
import type { ItemService } from "../items/ItemService"

export class AuctionService {
	private auctionData: AuctionData
	private itemService: ItemService

	constructor(itemService: ItemService, path: string) {
		this.auctionData = new AuctionData(path)
		this.itemService = itemService
	}

	deleteOldAuctionData(maxAge: number) {
		this.auctionData.deleteOldAuctions(Date.now() - maxAge)
	}

	searchForItem(query: string): ItemName | null {
		const names = this.auctionData.getInternalNames()
		const targets = names.map((name) => this.itemService.getItemResolver().resolve(name))
		const fuzzy = fuzzysort.go(query, targets, { key: "displayName", limit: 1 }).at(0)
		if (!fuzzy) return null
		return fuzzy.obj
	}

	getItemData(name: ItemName) {
		const data = this.auctionData.getLowestBin(name.internalName)
		if (!data) return null
		return {
			name: name.displayName,
			internalName: name.internalName,
			seenAt: new Date(data.timestamp),
			current: data.timestamp == data.latestTimestamp,
			lowestBin: data.lowestBin
		}
	}
}
