import { describe, it, expect } from "bun:test"
import { ItemNameResolver } from "../src/items/ItemNameResolver"
import testCases from "./cases/displaynames.json"

import neuItems from "./data/neuitems.json"
import skyblockItems from "./data/skyblockitems.json"

// @ts-expect-error
const itemResolver = new ItemNameResolver(neuItems, skyblockItems.items)

describe("ItemNameResolver", () => {
	for (const testCase of testCases) {
		it(`should resolve ${testCase.description}`, () => {
			const resolved = itemResolver.resolve(testCase.internalName)
			expect(resolved.displayName).toEqual(testCase.expectedDisplayName)
			expect(resolved.internalName).toEqual(testCase.internalName)
		})
	}
})
