export interface NeuLevelingJson {
	leveling_xp: number[]
	leveling_caps: NeuLevelingCapsJson
	runecrafting_xp: number[]
	slayer_xp: NeuSlayerXpJson
	slayer_boss_xp: number[]
	slayer_boss_xp_type: NeuSlayerBossXpTypeJson
	slayer_highest_tier: Record<string, number>
	fancy_name_to_slayer: Record<string, string>
	slayer_to_highest_tier: Record<string, number>
	slayer_tier_colors: string[]
	rng_meter_dungeon_score: Record<string, number>
	catacombs: number[]
	HOTM: number[]
	social: number[]
	bestiary: NeuBestiaryJson
}

export interface NeuLevelingCapsJson {
	taming: number
	mining: number
	foraging: number
	enchanting: number
	carpentry: number
	farming: number
	combat: number
	fishing: number
	alchemy: number
	runecrafting: number
	catacombs: number
	HOTM: number
	social: number
}

export interface NeuSlayerXpJson {
	zombie: number[]
	spider: number[]
	wolf: number[]
	enderman: number[]
	blaze: number[]
	vampire: number[]
}

export interface NeuSlayerBossXpTypeJson {
	vampire: number[]
}

export interface NeuBestiaryJson {
	ISLAND: number[]
	BOSS: number[]
	MOB: number[]
	caps: NeuBestiaryCapsJson
}

export interface NeuBestiaryCapsJson {
	ISLAND: number
	BOSS: number
	MOB: number
}
