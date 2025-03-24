import type { NeuItemJson } from "../types/NeuItemJson"
import { ItemNameResolver } from "./ItemNameResolver"
import type { NeuRepoManager } from "../neu/NeuRepoManager"
import type { NeuRepo } from "../neu/NeuRepo"

export class NeuItemService {
	private items: NeuItemJson[]

	constructor(repoManager: NeuRepoManager) {
		this.items = []
		repoManager.addListener(async (repo) => await this.load(repo))
	}

	getItemResolver() {
		return new ItemNameResolver(this.items)
	}

	private async load(repo: NeuRepo) {
		this.items = repo.getItems()
	}
}
