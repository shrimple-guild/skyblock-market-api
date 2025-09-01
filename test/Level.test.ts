import { describe, it, expect } from "bun:test"
import { LevelResolver } from "../src/utils/LevelResolver"

describe("LevelResolver", () => {
	const thresholds = [10, 50, 150]
	const resolver = LevelResolver.fromCumulative(thresholds)

	it("value is negative", () => {
		expect(() => resolver.resolve(-5)).toThrowError()
	})

	it("value is 0", () => {
		const result = resolver.resolve(0)
		expect(result).toEqual({ level: 0, maxValue: 150, nextLevelAt: 10, progress: 0, maxLevel: 3 })
	})

	it("value is below first threshold", () => {
		const result = resolver.resolve(5)
		expect(result).toEqual({ level: 0, maxValue: 150, nextLevelAt: 10, progress: 5, maxLevel: 3 })
	})

	it("value is equal to first threshold", () => {
		const result = resolver.resolve(10)
		expect(result).toEqual({ level: 1, maxValue: 150, nextLevelAt: 50, progress: 0, maxLevel: 3 })
	})

	it("value is between thresholds", () => {
		const result = resolver.resolve(25)
		expect(result).toEqual({ level: 1, maxValue: 150, nextLevelAt: 50, progress: 15, maxLevel: 3 })
	})

	it("value is just below last threshold", () => {
		const result = resolver.resolve(149)
		expect(result).toEqual({ level: 2, maxValue: 150, nextLevelAt: 150, progress: 99, maxLevel: 3 })
	})

	it("value is equal to last threshold", () => {
		const result = resolver.resolve(150)
		expect(result).toEqual({ level: 3, maxValue: 150, nextLevelAt: -1, progress: 0, maxLevel: 3 })
	})

	it("value is above last threshold", () => {
		const result = resolver.resolve(200)
		expect(result).toEqual({ level: 3, maxValue: 150, nextLevelAt: -1, progress: 50, maxLevel: 3 })
	})
})

describe("LevelResolver with max cap", () => {
	const thresholds = [10, 50, 150]
	const resolver = LevelResolver.fromCumulative(thresholds, 2)

	it("value is above restricted max level", () => {
		const result = resolver.resolve(150)
		expect(result).toEqual({ level: 2, maxValue: 50, nextLevelAt: -1, progress: 100, maxLevel: 2 })
	})
})
