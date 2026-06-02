export type LevelInfo = {
	level: number
	maxLevel: number
	maxValue: number
	nextLevelAt: number
	progress: number
}

export class LevelResolver {
	private readonly thresholds: number[]

	constructor(thresholds: number[]) {
		this.thresholds = thresholds
	}

	/**
	 * Create a LevelResolver from cumulative thresholds and an optional max level.
	 * Example: [10, 50, 150] -> level 1 at 10, level 2 at 50, etc.
	 */
	public static fromCumulative(thresholds: number[], maxLevel?: number): LevelResolver {
		if (!thresholds || thresholds.length == 0) {
			throw new Error("Thresholds must be a non-empty array.")
		}

		return new LevelResolver(thresholds.slice(0, maxLevel))
	}

	public static fromCumulativeMaxValue(thresholds: number[], maxValue?: number): LevelResolver {
		const index = thresholds.findIndex((value) => value == maxValue)
		const maxLevel = index != -1 ? index + 1 : undefined
		return new LevelResolver(thresholds.slice(0, maxLevel))
	}

	public resolve(value: number, maxLevel = this.thresholds.length): LevelInfo {
		if (value < 0) throw new Error("Value must be positive.")

		const thresholds = this.thresholds.slice(0, maxLevel)
		let tier = 0

		for (let i = 0; i < thresholds.length; i++) {
			if (value >= thresholds[i]) {
				tier = i + 1
			} else {
				break
			}
		}

		const maxValue = thresholds[thresholds.length - 1]
		const nextLevelAt = thresholds[tier] ?? -1

		const prevThreshold = thresholds[tier - 1] ?? 0
		const progress = value - prevThreshold

		return {
			maxLevel: thresholds.length,
			level: tier,
			maxValue,
			nextLevelAt,
			progress
		}
	}
}
