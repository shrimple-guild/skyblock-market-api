import fuzzysort from "fuzzysort"
import type { ItemName, ItemNameResolver } from "../items/ItemNameResolver"
import type { ApiSkyblockBazaarJson } from "../types/ApiSkyblockBazaarJson"
import { Bazaar } from "./Bazaar"
import type { BazaarProduct } from "./BazaarProduct"
import { HistoricalBazaar } from "./HistoricalBazaar"

export class BazaarService {
	private static URL = "https://api.hypixel.net/skyblock/bazaar"
	private bazaar: Bazaar
	private historical: HistoricalBazaar
	private itemNames: ItemNameResolver

	static async init(itemNames: ItemNameResolver, path?: string) {
		const bazaar = await BazaarService.fetchBazaar()
		return new BazaarService(bazaar, itemNames, path)
	}

	private constructor(bazaar: Bazaar, itemNames: ItemNameResolver, path?: string) {
		this.bazaar = bazaar
		this.itemNames = itemNames
		this.historical = new HistoricalBazaar(path)
	}

	private static async fetchBazaar(): Promise<Bazaar> {
		const response = await fetch(BazaarService.URL)
		const data = (await response.json()) as ApiSkyblockBazaarJson
		return new Bazaar(data)
	}

	updateItemNames(newItemNames: ItemNameResolver) {
		this.itemNames = newItemNames
	}

	async update() {
		this.bazaar = await BazaarService.fetchBazaar()
		this.historical.insertProducts(this.bazaar)
	}

	deleteOldProductData(before: number) {
		this.historical.deleteOldProducts(before)
	}

	searchForProduct(query: string): ItemName | null {
		const names = this.bazaar.getProductInternalNames()
		const targets = names.map((name) => this.itemNames.resolve(name))
		const fuzzy = fuzzysort.go(query, targets, { key: "displayName", limit: 1 }).at(0)
		if (!fuzzy) return null
		return fuzzy.obj
	}

	getBulkValue(name: ItemName, quantity: number) {
		const product = this.bazaar.getProduct(name.internalName)
		return {
			name: name.displayName,
			internalName: name.internalName,
			instaBuy: product.getBuyPrice(quantity),
			instaSell: product.getSellPrice(quantity)
		}
	}

	getProductData(name: ItemName) {
		const product = this.bazaar.getProduct(name.internalName)
		const oneDayAverage = this.historical.getAveragePrice(name.internalName, Date.now(), 24 * 60 * 60 * 100)
		return {
			name: name.displayName,
			internalName: name.internalName,
			instaBuy: product.getInstabuyPrice(),
			instaSell: product.getInstasellPrice(),
			sellMarketValue: product.getBuyPrice(),
			buyMarketValue: product.getSellPrice(),
			instaBuyAvg1Day: oneDayAverage.avgInstaBuy,
			instaSellAvg1Day: oneDayAverage.avgInstaSell
		}
	}
}
