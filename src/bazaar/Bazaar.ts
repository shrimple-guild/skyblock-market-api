import type { ApiSkyblockBazaarJson } from "../types/ApiSkyblockBazaarJson"
import { BazaarProduct } from "./BazaarProduct"

export class Bazaar {
	private raw: ApiSkyblockBazaarJson

	constructor(raw: ApiSkyblockBazaarJson) {
		this.raw = raw
	}

	getProduct(id: string): BazaarProduct {
		const product = this.raw.products[id]
		if (!product) throw new Error(`No such product "${id}".`)
		return new BazaarProduct(product)
	}

	getProducts(): BazaarProduct[] {
		const all: BazaarProduct[] = []
		for (const product of Object.keys(this.raw.products)) {
			all.push(this.getProduct(product))
		}
		return all
	}

	getProductInternalNames() {
		return this.getProducts().map((product) => product.getInternalName())
	}

	getLastUpdated() {
		return this.raw.lastUpdated
	}
}
