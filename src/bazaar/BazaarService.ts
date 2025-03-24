import fuzzysort from "fuzzysort"
import { ItemNameResolver, type ItemName } from "../items/ItemNameResolver"
import { Bazaar } from "./Bazaar"
import { HistoricalBazaar } from "./HistoricalBazaar"
import { TextUtils } from "../utils/TextUtils"
import { MillisecondDurations } from "../constants"
import { Hypixel } from "../hypixel/Hypixel"
import type { ItemService } from "../items/ItemService"

export class BazaarService {
	private bazaar: Bazaar
	private historical: HistoricalBazaar
	private itemService: ItemService

	static async init(itemService: ItemService, path?: string) {
		const bazaar = await Hypixel.fetchBazaar()
		return new BazaarService(itemService, bazaar, path)
	}

	private constructor(itemService: ItemService, bazaar: Bazaar, path?: string) {
		this.bazaar = bazaar
		this.itemService = itemService
		this.historical = new HistoricalBazaar(path)
	}

	async update() {
		this.bazaar = await Hypixel.fetchBazaar()
		this.historical.insertProducts(this.bazaar)
	}

	deleteOldProductData(maxAge: number) {
		this.historical.deleteOldProducts(Date.now() - maxAge)
	}

	searchForProduct(query: string): ItemName | null {
		const queryCleaned = TextUtils.attemptDeromanizeAll(query)
		const names = this.bazaar.getProductInternalNames()
		const targets = names.map((name) => this.itemService.getItemResolver().resolve(name))
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
