import fuzzysort from "fuzzysort"
import type { ItemName, ItemNameResolver } from "../items/ItemNameResolver"
import type { AuctionData } from "./AuctionData"

export class AuctionService {
    private auctionData: AuctionData
    private itemNames: ItemNameResolver

    constructor(auctionData: AuctionData, itemNames: ItemNameResolver) {
        this.auctionData = auctionData
        this.itemNames = itemNames
    }

    updateItemNames(newItemNames: ItemNameResolver) {
		this.itemNames = newItemNames
	}

    searchForItem(query: string): ItemName | null {
        const names = this.auctionData.getInternalNames()
        const targets = names.map((name) => this.itemNames.resolve(name))
        const fuzzy = fuzzysort.go(query, targets, { key: "displayName", limit: 1 }).at(0)
        if (!fuzzy) return null
		return fuzzy.obj
    }

    getItemData(name: ItemName) {
        const data = this.auctionData.getLatestAuction(name.internalName)
        const oneWeekAverage = this.auctionData.getAveragePrice(name.internalName, Date.now(), 24 * 60 * 60 * 100)
        if (!data) return null
        return {
            name: name.displayName,
			internalName: name.internalName,
            seenAt: new Date(data.timestamp),
            current: data.timestamp == data.latestTimestamp,
            lowestBin: data.lowestBin,
            oneWeekLowestBin: oneWeekAverage
        }
    }
}