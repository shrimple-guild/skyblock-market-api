import { describe, it, expect } from "bun:test"
import { InternalNameResolver } from "../src/items/InternalNameResolver"
import stocks from "./data/bazaarstocks.json"
import testCases from "./cases/internalnames.json"

const internalNameResolver = new InternalNameResolver(stocks)

describe("InternalName#resolveFromBazaarId", () => {
	for (const testCase of testCases.bazaar) {
		it(`should resolve ${testCase.description} from bazaar`, () => {
			const resolved = internalNameResolver.resolveBazaarStock(testCase.bazaarStock)
			expect(resolved).toEqual(testCase.expectedInternalName)
		})
	}
})
