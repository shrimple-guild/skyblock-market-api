export type ApiHypixelGuildResponse = {
	success: true
	guild: ApiHypixelGuild
}

export type ApiHypixelGuild = {
	_id: string
	name: string
	name_lower: string
	coins: number
	coinsEver: number
	created: number
	members: ApiHypixelGuildMember[]
	ranks: ApiHypixelGuildRank[]
	preferredGames: string[]
	description: string
	achievements: Record<string, number | undefined>
	exp: string
	tag: string
	tagColor: string
	chatMute: number
	guildExpByGameType: Record<string, number | undefined>
}

export type ApiHypixelGuildMember = {
	uuid: string
	rank: string
	joined: number
	questParticipation: number
	mutedTill?: number
	expHistory: Record<string, number>
}

export type ApiHypixelGuildRank = {
	name: string
	default: boolean
	tag: string
	created: number
	priority: number
}
