import { describe, it, expect } from "bun:test"
import { InternalName } from "../src/items/InternalName"
import testCases from "./cases/internalnames.json"

describe("InternalName#resolveFromBytes", () => {
	for (const testCase of testCases.bytes) {
		it(`should resolve ${testCase.description} from bytes`, () => {
			const resolved = InternalName.resolveFromBytes(testCase.itemBytes)
			expect(resolved).toEqual(testCase.expectedInternalName)
		})
	}
})

describe("InternalName#resolveFromBazaarId", () => {
	for (const testCase of testCases.bazaarId) {
		it(`should resolve ${testCase.description} from bazaar`, () => {
			const resolved = InternalName.resolveFromBazaarId(testCase.bazaarId)
			expect(resolved).toEqual(testCase.expectedInternalName)
		})
	}
})
