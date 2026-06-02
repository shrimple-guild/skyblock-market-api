import fuzzysort from "fuzzysort"
import { type BazaarItemName, type ItemName } from "../items/ItemNameResolver"
import { Bazaar } from "./Bazaar"
import { HistoricalBazaar } from "./HistoricalBazaar"
import { TextUtils } from "../utils/TextUtils"
import { MillisecondDurations } from "../constants"
import type { ItemService } from "../items/ItemService"
import type { HypixelClient } from "../hypixel/HypixelClient"

export class BazaarService {
	private hypixel: HypixelClient
	private bazaar: Bazaar
	private historical: HistoricalBazaar
	private itemService: ItemService

	static async init(hypixelClient: HypixelClient, itemService: ItemService, path?: string) {
		const bazaar = await hypixelClient.fetchBazaar()
		return new BazaarService(hypixelClient, itemService, bazaar, path)
	}

	private constructor(hypixelClient: HypixelClient, itemService: ItemService, bazaar: Bazaar, path?: string) {
		this.hypixel = hypixelClient
		this.bazaar = bazaar
		this.itemService = itemService
		this.historical = new HistoricalBazaar(path)
	}

	async update() {
		this.bazaar = await this.hypixel.fetchBazaar()
		this.historical.insertProducts(this.bazaar)
	}

	deleteOldProductData(maxAge: number) {
		this.historical.deleteOldProducts(Date.now() - maxAge)
	}

	getAllProducts(): BazaarItemName[] {
		return this.bazaar.getStockNames().map((stockName) => {
			const internalName = this.itemService.getInternalNameResolver().resolveBazaarStock(stockName)
			return { stockName, ...this.itemService.getItemResolver().resolve(internalName) }
		})
	}

	searchForProduct(query: string): BazaarItemName | null {
		const queryCleaned = TextUtils.attemptDeromanizeAll(query)

		const fuzzy = fuzzysort.go(queryCleaned, this.getAllProducts(), { key: "displayName", limit: 1 }).at(0)
		if (!fuzzy) return null
		return fuzzy.obj
	}

	getBulkValue(name: BazaarItemName, quantity?: number) {
		const product = this.bazaar.getProduct(name.stockName)

		return {
			name: name.displayName,
			internalName: name.internalName,
			instaBuy: product.getBuyPrice(quantity),
			instaSell: product.getSellPrice(quantity)
		}
	}

	getProductData(name: BazaarItemName) {
		const product = this.bazaar.getProduct(name.stockName)
		const oneDayAverage = this.historical.getAveragePrice(name.stockName, Date.now(), MillisecondDurations.ONE_DAY)
		const oneWeekAverage = this.historical.getAveragePrice(
			name.stockName,
			Date.now(),
			MillisecondDurations.ONE_WEEK
		)
		return {
			name: name.displayName,
			internalName: name.internalName,
			stockName: name.stockName,
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
