import { describe, it, expect, beforeEach } from "bun:test"
import { AuctionData } from "../src/auctions/AuctionData"

let auctionData: AuctionData
const now = 1700000000000

beforeEach(() => {
	auctionData = new AuctionData()
	auctionData.insertBin(now - 60000, "test_item_1", 100)
	auctionData.insertBin(now - 30000, "test_item_1", 150)
	auctionData.insertBin(now - 10000, "test_item_1", 200)
	auctionData.insertBin(now, "irrelevant", 1000)
	auctionData.insertBin(now - 20000, "irrelevant", 1500)
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
		const latest = auctionData.getLatestAuction("test_item_1")
		expect(latest).not.toBeNull()
		expect(latest?.lowestBin).toBe(200)
		expect(latest?.timestamp).toBe(now - 10000)
		expect(latest?.latestTimestamp).toBe(now)
	})

	it("should return null for non-existent items", () => {
		const latest = auctionData.getLatestAuction("not_an_item")
		expect(latest).toBeNull()
	})

	it("should calculate the correct average price in full time window", () => {
		const average = auctionData.getAveragePrice("test_item_1", now, 60000)
		expect(average).not.toBeNull()
		expect(average).toBeCloseTo(150)
	})

	it("should calculate the correct average price in the given time window", () => {
		const average = auctionData.getAveragePrice("test_item_1", now, 30000)
		expect(average).toBeCloseTo(175)
	})

	it("should return null average price if none in window", () => {
		const average = auctionData.getAveragePrice("test_item_1", now, 5000)
		expect(average).toBeNull()
	})

	it("should get all internal names", () => {
		const names = auctionData.getInternalNames()
		expect(names.sort()).toEqual(["test_item_1", "irrelevant"].sort())
	})
})
