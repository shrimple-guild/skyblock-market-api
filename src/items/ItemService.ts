import { ItemNameResolver } from "./ItemNameResolver"
import type { NeuRepoManager } from "../neu/NeuRepoManager"
import type { NeuRepo } from "../neu/NeuRepo"
import { Hypixel } from "../hypixel/Hypixel"
import { InternalNameResolver } from "./InternalNameResolver"
import type { NeuBazaarStockJson } from "../types/NeuBazaarStockJson"
import type { HypixelClient } from "../hypixel/HypixelClient"

export class ItemService {
	private hypixel: HypixelClient
	private itemResolver: ItemNameResolver
	private internalNameResolver: InternalNameResolver

	constructor(hypixelClient: HypixelClient, repoManager: NeuRepoManager) {
		this.hypixel = hypixelClient
		this.itemResolver = new ItemNameResolver([], [])
		this.internalNameResolver = new InternalNameResolver([])
		repoManager.addListener(async (repo) => await this.load(repo))
	}

	getItemResolver() {
		return this.itemResolver
	}

	getInternalNameResolver() {
		return this.internalNameResolver
	}

	private async load(repo: NeuRepo) {
		const neuItems = repo.getItems()
		const skyblockItems = await this.hypixel.fetchItems()
		this.itemResolver = new ItemNameResolver(neuItems, skyblockItems)
		const neuBazaarStocks = repo.getConstant<NeuBazaarStockJson[]>("bazaarstocks")
		if (neuBazaarStocks != null) {
			this.internalNameResolver = new InternalNameResolver(neuBazaarStocks)
		}
	}
}
