export interface ApiSkyblockGardenResponse {
	success: true
	garden: ApiSkyblockGarden
}

export interface ApiSkyblockGarden {
	resources_collected: Record<ApiSkyblockGardenResource, number>
}

export type ApiSkyblockGardenResource =
	| "WHEAT"
	| "CARROT_ITEM"
	| "SUGAR_CANE"
	| "POTATO_ITEM"
	| "PUMPKIN"
	| "MELON"
	| "INK_SACK:3"
	| "MUSHROOM_COLLECTION"
	| "CACTUS"
	| "NETHER_STALK"
	| "MOONFLOWER"
	| "WILD_ROSE"
	| "DOUBLE_PLANT"