import { describe, it, expect } from "bun:test"
import { ItemNameResolver } from "../src/items/ItemNameResolver"
import neuItems from "./data/neuitemtest.json"

const itemResolver = new ItemNameResolver(neuItems)

describe("ItemNameResolver", () => {

	it("should resolve pets", () => {
		const tiger = itemResolver.resolve("TIGER;3")
		expect(tiger.displayName).toEqual("Epic Tiger")
		const enderDragon = itemResolver.resolve("ENDER_DRAGON;4+MAX")
		expect(enderDragon.displayName).toEqual("[Lvl 100] Legendary Ender Dragon")
	})

	it("should resolve god potion", () => {
		const oldGodPotion = itemResolver.resolve("GOD_POTION")
		expect(oldGodPotion.displayName).toEqual("God Potion (Legacy)")
		const newGodPotion = itemResolver.resolve("GOD_POTION_2")
		expect(newGodPotion.displayName).toEqual("God Potion")
	})

	it("should resolve book", () => {
		const name = itemResolver.resolve("PROTECTION;6")
		expect(name.displayName).toEqual("Protection 6 Enchanted Book")
	})

	it("should resolve shard", () => {
		const name = itemResolver.resolve("ATTRIBUTE_SHARD_MANA_REGENERATION;4")
		expect(name.displayName).toEqual("Mana Regeneration 4 Attribute Shard")
	})

	it("should resolve pet skill xp boost", () => {
		const name = itemResolver.resolve("PET_ITEM_FISHING_SKILL_BOOST_EPIC")
		expect(name.displayName).toEqual("Epic Fishing Exp Boost")
	})
	
})
