import { TextUtils } from "../utils/TextUtils"
import type { ApiSkyblockBazaarResponse } from "../types/ApiSkyblockBazaarResponse"
import { BazaarProduct } from "./BazaarProduct"

export class Bazaar {
	private raw: ApiSkyblockBazaarResponse
	private products: Map<string, BazaarProduct>
	private names?: string[]

	constructor(raw: ApiSkyblockBazaarResponse) {
		this.raw = raw
		this.products = new Map()
		for (const rawProduct of Object.values(this.raw.products)) {
			const product = new BazaarProduct(rawProduct)
			if (!product.hasOrders()) continue
			this.products.set(product.getStockName(), product)
		}
	}

	getProduct(stockName: string): BazaarProduct {
		const product = this.products.get(stockName)
		if (!product) throw new Error(`No product with stock name "${stockName}".`)
		return product
	}

	getProducts(): BazaarProduct[] {
		return Array.from(this.products.values())
	}

	getStockNames(): string[] {
		if (this.names == null) {
			this.names = Array.from(this.products.keys()).sort(TextUtils.naturalSort)
		}
		return this.names
	}

	getLastUpdated() {
		return this.raw.lastUpdated
	}
}
