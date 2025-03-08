import { describe, it, expect } from "bun:test"
import { ItemNameResolver } from "../src/items/ItemNameResolver"
import neuItems from "./data/neuitemtest.json"

const itemResolver = new ItemNameResolver(neuItems)

describe("ItemResolver", () => {
	it("should resolve book", () => {
		const name = itemResolver.resolve("PROTECTION;6")
		expect(name.displayName).toEqual("Protection 6 Enchanted Book")
	})

	it("should resolve shard", () => {
		const name = itemResolver.resolve("ATTRIBUTE_SHARD_MANA_REGENERATION;4")
		expect(name.displayName).toEqual("Mana Regeneration 4 Attribute Shard")
	})
})
