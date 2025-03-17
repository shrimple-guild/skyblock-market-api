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
}

export interface ApiSkyblockMember {}
