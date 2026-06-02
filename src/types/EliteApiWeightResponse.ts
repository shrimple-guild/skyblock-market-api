import type { CropType } from "./CropType"

export interface EliteApiWeightProfileResponse {
	totalWeight: number
	cropWeight: Record<CropType, number>
	bonusWeight: Record<string, number>
	uncountedCrops: Record<CropType, number>
	pests: Record<EliteApiPestType, number>
	lastUpdated: number
}

export type EliteApiPestType =
	| "beetle"
	| "cricket"
	| "fly"
	| "locust"
	| "mite"
	| "mosquito"
	| "moth"
	| "rat"
	| "slug"
	| "earthworm"
	| "mouse"
	| "dragonfly"
	| "firefly"
	| "mantis"
	| "lunarMoth"