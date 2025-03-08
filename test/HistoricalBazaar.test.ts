import { describe, it, expect, beforeEach } from "bun:test"
import { HistoricalBazaar } from "../src/bazaar/HistoricalBazaar"
import { Bazaar } from "../src/bazaar/Bazaar"
import bazaarResponse from "./data/bazaar.json"

let historicalBazaar: HistoricalBazaar
const now = 1740863200000

beforeEach(() => {
    historicalBazaar = new HistoricalBazaar()
    historicalBazaar.insertProduct(now - 10000, "product_1", 50, 40)
    historicalBazaar.insertProduct(now - 20000, "product_1", 30, 20)
})

describe("HistoricalBazaar", () => {
    it("should insert bazaar", () => {
        historicalBazaar.insertProducts(new Bazaar(bazaarResponse))
        const chiliData = historicalBazaar.getAveragePrice("CHILI_PEPPER", now, 1e6)
        expect(chiliData.avgInstaBuy).not.toBe(0)
        expect(chiliData.avgInstaSell).not.toBe(0)
    })

    it("should get average prices over window", () => {
        const data = historicalBazaar.getAveragePrice("product_1", now, 1e6)
        expect(data.avgInstaBuy).toBe(40)
        expect(data.avgInstaSell).toBe(30)
    })

    it("should get no prices if window too small", () => {
        const data = historicalBazaar.getAveragePrice("product_1", now, 5000)
        expect(data.avgInstaBuy).toBe(0)
        expect(data.avgInstaSell).toBe(0)
    })
})
