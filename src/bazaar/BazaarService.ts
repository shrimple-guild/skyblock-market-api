import fuzzysort from "fuzzysort"
import type { ItemName, ItemNameResolver } from "../items/ItemNameResolver"
import type { ApiSkyblockBazaarJson } from "../types/ApiSkyblockBazaarJson"
import { Bazaar } from "./Bazaar"
import { HistoricalBazaar } from "./HistoricalBazaar"
import { TextUtils } from "../TextUtils"
import { MillisecondDurations } from "../constants"

export class BazaarService {
	private static URL = "https://api.hypixel.net/v2/skyblock/bazaar"
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

	deleteOldProductData(maxAge: number) {
		this.historical.deleteOldProducts(Date.now() - maxAge)
	}

	searchForProduct(query: string): ItemName | null {
		const queryCleaned = TextUtils.attemptDeromanizeAll(query)
		const names = this.bazaar.getProductInternalNames()
		const targets = names.map((name) => this.itemNames.resolve(name))
		const fuzzy = fuzzysort.go(queryCleaned, targets, { key: "displayName", limit: 1 }).at(0)
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
		const oneDayAverage = this.historical.getAveragePrice(
			name.internalName,
			Date.now(),
			MillisecondDurations.ONE_DAY
		)
		const oneWeekAverage = this.historical.getAveragePrice(
			name.internalName,
			Date.now(),
			MillisecondDurations.ONE_WEEK
		)
		return {
			name: name.displayName,
			internalName: name.internalName,
			sellMarketValue: product.getBuyPrice(),
			buyMarketValue: product.getSellPrice(),
			current: {
				instaBuy: product.getInstabuyPrice(),
				instaSell: product.getInstasellPrice()
			},
			oneDayAverage,
			oneWeekAverage
		}
	}
}
