import { ItemNameResolver } from "./ItemNameResolver"
import type { NeuRepoManager } from "../neu/NeuRepoManager"
import type { NeuRepo } from "../neu/NeuRepo"
import { Hypixel } from "../hypixel/Hypixel"

export class ItemService {
	private itemResolver: ItemNameResolver

	constructor(repoManager: NeuRepoManager) {
		this.itemResolver = new ItemNameResolver([], [])
		repoManager.addListener(async (repo) => await this.load(repo))
	}

	getItemResolver() {
		return this.itemResolver
	}

	private async load(repo: NeuRepo) {
		const neuItems = repo.getItems()
		const skyblockItems = await Hypixel.fetchItems()
		this.itemResolver = new ItemNameResolver(neuItems, skyblockItems)
	}
}
