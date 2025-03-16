export interface ApiSkyblockProfilesJson {
	success: true
	profiles: ApiSkyblockProfile[] | null
}

export interface ApiSkyblockProfile {
	profile_id: string
	community_upgrades: any
	members: Record<string, ApiSkyblockMember>
	banking?: {
		balance: number
	}
	game_mode?: string
    cute_name: string
	selected: boolean
}

export interface ApiSkyblockMember {
	player_data?: {
		experience?: Record<string, number | undefined>
		unlocked_coll_tiers?: string[]
	}
	leveling?: {
		experience?: number
	}
	jacobs_contest?: {
		perks?: {
			double_drops?: number
			farming_level_cap?: number
			personal_bests?: boolean
		}
	}
	pets_data?: {
        pets: any[],
		pet_care?: {
			coins_spent?: number
			pet_types_sacrificed?: string[]
		}
	}
	collection?: Record<string, number>
	bestiary?: {
		migrated_stats?: boolean
		migration?: boolean
		kills?: Record<string, number | undefined>
		deaths?: Record<string, number | undefined>
		milestone?: {
			last_claimed_milestone?: number
		}
	}
	slayer?: {
		slayer_bosses?: Record<string, ApiSlayerData | undefined>
	}
	trophy_fish?: {
		rewards: number[]
	} & Record<string, number | undefined>
	dungeons?: {
		dungeon_types?: {
			catacombs?: ApiCommonDungeonTypeData & {
				experience: number
			}
			master_catacombs?: ApiCommonDungeonTypeData
		}
		player_classes?: {
			healer?: { experience: number }
			mage?: { experience: number }
			berserk?: { experience: number }
			archer?: { experience: number }
			tank?: { experience: number }
		}
		secrets?: number
	}
}

interface ApiCommonDungeonTypeData {
	tier_completions: Record<string, number>
	milestone_completions: Record<string, number>
	fastest_time: Record<string, number>
	fastest_time_s: Record<string, number>
	fastest_time_s_plus: Record<string, number>
}

export type ApiSlayerData = {
	claimed_levels: Record<string, boolean | undefined> 
	xp?: number
} & Record<string, number | undefined>
