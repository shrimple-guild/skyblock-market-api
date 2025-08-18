import type { ApiHypixelPlayer } from "../types/ApiHypixelPlayerResponse"
import { UuidUtils } from "../utils/UuidUtils"

export type HypixelStatus = { status: "online" } | { status: "offline"; lastSeen: Date } | { status: "unknown" }

export class HypixelPlayer {
	private readonly uuid: string
	private readonly hypixelName: string
	private readonly joined: Date
	private readonly status: HypixelStatus
	private readonly raw: any
	private readonly discordTag?: string

	constructor(raw: ApiHypixelPlayer) {
		this.raw = raw
		this.uuid = UuidUtils.standard(raw.uuid)
		this.hypixelName = raw.displayname
		this.joined = new Date(raw.firstLogin)
		this.status = HypixelPlayer.resolveStatus(raw.lastLogin, raw.lastLogout)
		this.discordTag = raw.socialMedia?.links?.DISCORD
	}

	private static resolveStatus(lastLogin: number | undefined, lastLogout: number | undefined): HypixelStatus {
		if (!lastLogin || !lastLogout) {
			return { status: "unknown" }
		}
		return lastLogin > lastLogout ? { status: "online" } : { status: "offline", lastSeen: new Date(lastLogout) }
	}
}
