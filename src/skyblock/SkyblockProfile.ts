import type { ApiSkyblockMember, ApiSkyblockProfile } from "../types/ApiSkyblockProfilesResponse"
import { UuidUtils } from "../utils/UuidUtils"
import { SkyblockMember } from "./SkyblockMember"

export class SkyblockProfile {
	constructor(
		private uuid: string,
		private raw: ApiSkyblockProfile
	) {}

    getProfileData() {
        const rawMembers: Record<string, ApiSkyblockMember> = {}
        for (const [uuid, member] of Object.entries(this.getMembers())) {
            rawMembers[uuid] = member.getRaw()
        }
        return {
            gamemode: this.getGamemode(),
            cuteName: this.getName(),
            id: this.getProfileId(),
            selected: this.isSelected(),
            member: this.getQueriedMember().getRaw(),
            members: rawMembers
        }
    }

	getQueriedMember(): SkyblockMember {
		const rawMember = this.getMember(this.uuid)
		if (rawMember == null) {
			throw Error(`Queried member ${this.uuid} is somehow not a member of profile ${this.getProfileId()}. Weird!`)
		}
        return rawMember
	}

	getGamemode(): string {
		return this.raw.game_mode ?? "classic"
	}

	getName(): string {
		return this.raw.cute_name
	}

	getProfileId(): string {
		const uuid = this.raw.profile_id
		return uuid
	}

	getMembers(): Record<string, SkyblockMember> {
		const members: Record<string, SkyblockMember> = {}
		for (const uuid of Object.keys(this.raw.members)) {
			members[uuid] = this.getMember(uuid)
		}
		return members
	}

	getMember(uuid: string) {
		const rawMember = this.raw.members[UuidUtils.compact(uuid)]
		return new SkyblockMember(rawMember)
	}

	isSelected(): boolean {
		return this.raw.selected
	}
}
