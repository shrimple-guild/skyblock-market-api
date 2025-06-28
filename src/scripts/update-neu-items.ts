import { NeuRepoManager } from "../neu/NeuRepoManager"
import type { NeuItemJson } from "../types/NeuItemJson"

const neuRepoManager = new NeuRepoManager("NotEnoughUpdates", "NotEnoughUpdates-REPO", "master", "./src/data")

let newItems: NeuItemJson[] = []

neuRepoManager.addListener((listener) => {
	newItems = listener.getItems()
})

console.log("Loading NEU repository data...")
await neuRepoManager.load()

console.log(`Loaded ${newItems.length} items.`)

const path = "./test/data/neuitems.json";
const file = Bun.file(path)
await Bun.write(file, JSON.stringify(newItems, null, 4))
console.log("Wrote NEU items to file, exiting.")