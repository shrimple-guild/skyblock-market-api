import { describe, it, expect } from "bun:test"
import { ItemNameResolver } from "../src/items/ItemNameResolver"
import type { NeuItemJson } from "../src/types/NeuItemJson"
import testCases from "./cases/displaynames.json"

const neuItems: NeuItemJson[] = await Bun.file("./test/data/neuitems.json").json()
const itemResolver = new ItemNameResolver(neuItems)

describe("ItemNameResolver", () => {
	for (const testCase of testCases) {
		it(`should resolve ${testCase.description}`, () => {
			const resolved = itemResolver.resolve(testCase.internalName)
			expect(resolved.displayName).toEqual(testCase.expectedDisplayName)
			expect(resolved.internalName).toEqual(testCase.internalName)
		})
	}
})
