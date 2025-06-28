import { describe, it, expect } from "bun:test"
import { Bazaar } from "../src/bazaar/Bazaar"
import bazaarResponse from "./data/bazaar.json"
import bazaarChiliPepper from "./data/bazaarproduct.json"
import bazaarEmpty from "./data/bazaarproductempty.json"
import { BazaarProduct } from "../src/bazaar/BazaarProduct"

describe("Bazaar", () => {
	it("should get all product ids", () => {
		const bazaar = new Bazaar(bazaarResponse)
		const productIds = bazaar.getProducts()
		expect(productIds.length).toBeGreaterThanOrEqual(1000)
	})

	it("should get a product by its product id", () => {
		const bazaar = new Bazaar(bazaarResponse)
		const chiliPepper = bazaar.getProduct("CHILI_PEPPER")
		expect(chiliPepper.getStockName()).toBe("CHILI_PEPPER")
	})
})

describe("BazaarProduct", () => {
	it("should get values of an product with orders", () => {
		const product = new BazaarProduct(bazaarChiliPepper)
		expect(product.getInstabuyPrice()).toBe(191844.6)
		expect(product.getInstasellPrice()).toBe(178993.9)
		const { quantity: sellQuantity, value: sellValue } = product.getSellPrice()
		expect(sellQuantity).toBe(3632)
		expect(sellValue).toBeCloseTo(650105021.8)

		const { quantity: buyQuantity, value: buyValue } = product.getBuyPrice(100)
		expect(buyQuantity).toBe(100)
		expect(buyValue).toBeCloseTo(19184467.9)

		const { quantity: oversellQuantity, value: oversellPrice } = product.getSellPrice(4000)
		expect(oversellQuantity).toBe(3632)
		expect(oversellPrice).toBeCloseTo(650105021.8)
	})

	it("should get values of an product without orders", () => {
		const product = new BazaarProduct(bazaarEmpty)
		expect(product.getInstabuyPrice()).toBe(null)
		expect(product.getInstasellPrice()).toBe(null)
		const { quantity: sellQuantity, value: sellValue } = product.getSellPrice()
		expect(sellQuantity).toBe(0)
		expect(sellValue).toBe(0)
	})
})
