import type { ApiHypixelGuild, ApiHypixelGuildMember } from "../types/ApiHypixelGuildResponse"
import { UuidUtils } from "../utils/UuidUtils"

export class HypixelGuild {
	readonly id: string
	readonly name: string
	readonly created: Date
	readonly members: HypixelGuildMember[]
	private readonly raw: ApiHypixelGuild

	constructor(raw: ApiHypixelGuild) {
		this.raw = raw
		this.id = raw._id
		this.name = raw.name
		this.created = new Date(raw.created)
		this.members = raw.members.map((m) => new HypixelGuildMember(m))
	}

	getMember(uuid: string): HypixelGuildMember | undefined {
		return this.members.find((m) => m.uuid === UuidUtils.standard(uuid))
	}

	getMemberUuids(): string[] {
		return this.members.map((m) => m.uuid)
	}
}

export class HypixelGuildMember {
	readonly uuid: string
	readonly rank: string
	readonly joined: Date
	readonly questParticipation: number
	readonly mutedUntil: Date
	readonly expHistory: Record<string, number>
	private readonly raw: ApiHypixelGuildMember

	constructor(raw: ApiHypixelGuildMember) {
		this.raw = raw
		this.uuid = UuidUtils.standard(raw.uuid)
		this.rank = raw.rank
		this.joined = new Date(raw.joined)
		this.questParticipation = raw.questParticipation ?? 0
		this.mutedUntil = new Date(raw.mutedTill ?? 0)
		this.expHistory = raw.expHistory
	}
}
