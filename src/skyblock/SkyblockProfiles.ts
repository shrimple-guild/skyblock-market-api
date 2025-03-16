import type { ApiSkyblockProfile } from "../types/ApiSkyblockProfilesResponse"
import { UuidUtils } from "../utils/UuidUtils"
import { SkyblockProfile } from "./SkyblockProfile"

export class SkyblockProfiles {
	private uuid: string
	private profiles: SkyblockProfile[]

	constructor(uuid: string, profiles: ApiSkyblockProfile[]) {
		this.uuid = UuidUtils.standard(uuid)
		this.profiles = profiles.map((profile) => new SkyblockProfile(this.uuid, profile))
	}

	getSelectedProfile(): SkyblockProfile | null {
		return this.profiles.find((profile) => profile.isSelected()) ?? null
	}

	getMainProfile(): SkyblockProfile {
		let mainProfile = this.profiles[0]
		for (const profile of this.profiles) {
			if (
				profile.getQueriedMember().getSkyblockExperience() >
				mainProfile.getQueriedMember().getSkyblockExperience()
			) {
				mainProfile = profile
			}
		}
		return mainProfile
	}

	getBingoProfile(): SkyblockProfile | null {
		return this.profiles.find((profile) => profile.getGamemode() == "bingo") ?? null
	}

	getByCuteName(name: string): SkyblockProfile | null {
		return this.profiles.find((profile) => profile.getName().toLowerCase() == name.toLowerCase()) ?? null
	}

	getByQuery(query: string): SkyblockProfile | null {
		switch (query.toLowerCase()) {
			case "main":
				return this.getMainProfile()
			case "selected":
				return this.getSelectedProfile()
			case "bingo":
				return this.getBingoProfile()
			default:
				return this.getByCuteName(query)
		}
	}
}
