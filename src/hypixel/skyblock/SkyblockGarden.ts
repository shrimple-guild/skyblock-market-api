import { getLogger } from "log4js"
import type { ApiSkyblockGarden, ApiSkyblockGardenResponse } from "../../types/ApiSkyblockGardenResponse"
import type { CropType } from "../../types/CropType"

export class SkyblockGarden {
	private static readonly RESOURCE_MAP: Record<string, CropType> = {
		WHEAT: "Wheat",
		CARROT_ITEM: "Carrot",
		POTATO_ITEM: "Potato",
		PUMPKIN: "Pumpkin",
		MELON: "Melon",
		CACTUS: "Cactus",
		MUSHROOM_COLLECTION: "Mushroom",
		SUGAR_CANE: "Sugar Cane",
		NETHER_STALK: "Nether Wart",
		INK_SACK: "Cocoa Beans",
		"INK_SACK:3": "Cocoa Beans",
		DOUBLE_PLANT: "Sunflower", // hypixel why...
		WILD_ROSE: "Wild Rose",
		MOONFLOWER: "Moonflower"
	}

	private readonly resources: Map<CropType, number>

	constructor(garden: ApiSkyblockGarden) {
		this.resources = new Map()
        
		const collected = garden.resources_collected

		for (const [rawKey, value] of Object.entries(collected)) {
			const crop = SkyblockGarden.RESOURCE_MAP[rawKey]
			if (!crop) continue
			this.resources.set(crop, value)
		}
	}

	public getCrop(crop: CropType): number {
		return this.resources.get(crop) ?? 0
	}

	public getAll(): Record<CropType, number> {
		const result = {} as Record<CropType, number>

		for (const [crop, value] of this.resources.entries()) {
			result[crop] = value
		}

		return result
	}
}