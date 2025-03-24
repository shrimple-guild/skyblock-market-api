import { it, expect } from "bun:test"
import { NeuRepoManager } from "../src/neu/NeuRepoManager"

const repo = new NeuRepoManager("NotEnoughUpdates", "NotEnoughUpdates-REPO", "master", "./src/data")



it("should get constant", () => {
    const json = repo.getConstant<any>("constants/bestiary.json")
    expect(json).not.toBe(null)
})

it("should get items", () => {
    const items = repo.getFiles("items/*.json")
    expect(items.length).toBeGreaterThan(1000)
})

await repo.load()