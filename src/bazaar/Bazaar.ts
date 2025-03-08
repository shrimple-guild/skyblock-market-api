import type { ApiSkyblockBazaarJson } from "../types/ApiSkyblockBazaarJson"
import { BazaarProduct } from "./BazaarProduct"

export class Bazaar {
	private raw: ApiSkyblockBazaarJson
	private products: Map<string, BazaarProduct>

	constructor(raw: ApiSkyblockBazaarJson) {
		this.raw = raw
		this.products = new Map()
		for (const rawProduct of Object.values(this.raw.products)) {
			const product = new BazaarProduct(rawProduct)
			this.products.set(product.getInternalName(), product)
		}
	}

	getProduct(internalName: string): BazaarProduct {
		const product = this.products.get(internalName)
		if (!product) throw new Error(`No product with internal name "${internalName}".`)
		return product
	}

	getProducts(): BazaarProduct[] {
		return Array.from(this.products.values())
	}

	getProductInternalNames(): string[] {
		return Array.from(this.products.keys())
	}

	getLastUpdated() {
		return this.raw.lastUpdated
	}
}
