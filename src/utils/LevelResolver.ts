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

	public resolve(value: number): LevelInfo {
		if (value < 0) {
			throw new Error("Value must be positive.")
		}
		let tier = 0

		for (let i = 0; i < this.thresholds.length; i++) {
			if (value >= this.thresholds[i]) {
				tier = i + 1
			} else {
				break
			}
		}

		const maxValue = this.thresholds[this.thresholds.length - 1]
		const nextLevelAt = this.thresholds[tier] ?? -1

		const prevThreshold = this.thresholds[tier - 1] ?? 0
		const progress = value - prevThreshold

		return {
			maxLevel: this.thresholds.length,
			level: tier,
			maxValue,
			nextLevelAt,
			progress
		}
	}
}
