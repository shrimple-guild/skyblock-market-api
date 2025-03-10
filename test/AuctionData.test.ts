import { describe, it, expect, beforeEach } from "bun:test"
import { AuctionData } from "../src/auctions/AuctionData"

let auctionData: AuctionData
const now = 1700000000000

beforeEach(() => {
	auctionData = new AuctionData()
	auctionData.insertBin(now - 60000, "test_item_1", 100)
	auctionData.insertBin(now - 30000, "test_item_1", 150)
	auctionData.insertBin(now - 20000, "irrelevant", 1500)
	auctionData.insertBin(now - 10000, "test_item_1", 200)
	auctionData.insertBin(now, "irrelevant", 1000)
})

describe("AuctionData", () => {
	it("should insert bulk bins", () => {
		auctionData.insertBins(now, [
			{ internalName: "test_item_a", lowestBin: 10 },
			{ internalName: "test_item_b", lowestBin: 20 },
			{ internalName: "test_item_c", lowestBin: 30 },
			{ internalName: "test_item_d", lowestBin: 40 },
			{ internalName: "test_item_e", lowestBin: 50 }
		])
		expect(auctionData.getInternalNames()).toContain("test_item_a")
	})

	it("should retrieve the latest auction", () => {
		const latest = auctionData.getLowestBin("test_item_1")
		expect(latest).not.toBeNull()
		expect(latest?.lowestBin).toBe(200)
		expect(latest?.timestamp).toBe(now - 10000)
		expect(latest?.latestTimestamp).toBe(now)
	})

	it("should return null for non-existent items", () => {
		const latest = auctionData.getLowestBin("not_an_item")
		expect(latest).toBeNull()
	})

	it("should get all internal names", () => {
		const names = auctionData.getInternalNames()
		expect(names.sort()).toEqual(["test_item_1", "irrelevant"].sort())
	})
})
