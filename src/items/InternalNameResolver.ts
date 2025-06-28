import type { NeuBazaarStockJson } from "../types/NeuBazaarStockJson"

export class InternalNameResolver {
	private internalNames: Map<string, string>

	constructor(bazaarStocks: NeuBazaarStockJson[]) {
		this.internalNames = new Map()
		for (const item of bazaarStocks) {
			this.internalNames.set(item.stock, item.id)
		}
	}

	public resolveBazaarStock(item: string): string {
		const resolved = this.internalNames.get(item)
		return resolved ?? item.replaceAll(":", "-")
	}
}
