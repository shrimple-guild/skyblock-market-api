import { describe, it, expect } from "bun:test"
import testCases from "./cases/internalnames.json"
import { resolveAuctionItem } from "../src/workers/AuctionInternalNameResolver"

describe("InternalName#resolveFromBytes", () => {
	for (const testCase of testCases.bytes) {
		it(`should resolve ${testCase.description} from bytes`, () => {
			const resolved = resolveAuctionItem(testCase.itemBytes)
			expect(resolved).toEqual(testCase.expectedInternalName)
		})
	}
})
