export type ApiHypixelPlayerResponse = {
	success: true
	player: ApiHypixelPlayer
}

export type ApiHypixelPlayer = {
	uuid: string
	socialMedia?: {
		links?: {
			DISCORD?: string
		}
	}
	displayname: string
	lastLogout: number
	lastLogin: number
	firstLogin: number
	newPackageRank: string
	monthlyPackageRank: string
	networkExp: number
	stats: ApiHypixelPlayerStats
}

export interface ApiHypixelPlayerStats {
	MainLobby: {
		fishing: {
			stats: any
			fireproofing: any
			orbs: any
			enchants: any
			settings: any
			special_fish: any
		}
	}
}
