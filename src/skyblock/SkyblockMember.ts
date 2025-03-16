import type { ApiSkyblockMember } from "../types/ApiSkyblockProfilesResponse"

export class SkyblockMember {
	constructor(private raw: ApiSkyblockMember) {}

    getRaw() {
        return this.raw
    }

	getSkyblockExperience() {
		return this.raw?.leveling?.experience ?? 0
	}

	getSkyblockLevel() {
		return this.getSkyblockExperience() / 100
	}

	isCollectionsApiEnabled() {
		return this.raw.collection != null
	}

	getCollection(id: string) {
		return this.raw.collection?.[id] ?? 0
	}

	// this doesn't quite work, but it might be a hypixel API bug?
	getUnlockedCollectionTier(id: string): number {
		const tiers = this.raw.player_data?.unlocked_coll_tiers ?? []
		let highestUnlockedTier = 0
		for (const unlockedTier of tiers) {
			const split = unlockedTier.split("_")
			const tier = parseInt(split.pop() ?? "0")
			const collection = split.join("_")
			if (collection == id && tier > highestUnlockedTier) {
				highestUnlockedTier = tier
			}
		}
		return highestUnlockedTier
	}

	isSkillsApiEnabled() {
		return this.raw.player_data?.experience != null
	}

	getFarmingLevelCap() {
		return (this.raw.jacobs_contest?.perks?.farming_level_cap ?? 0) + 50
	}

	getTamingLevelCap() {
		return (this.raw.pets_data?.pet_care?.pet_types_sacrificed?.length ?? 0) + 50
	}

	getSkillXp(name: string) {
		return this.raw.player_data?.experience?.[`SKILL_${name.toUpperCase()}`] ?? 0
	}

	getBestiaryKills(mob: string): number {
		return this.raw.bestiary?.kills?.[mob] ?? 0
	}

	getBestiaryDeaths(mob: string): number {
		return this.raw.bestiary?.deaths?.[mob] ?? 0
	}

	getSlayerXp(slayer: string) {
		return this.raw.slayer?.slayer_bosses?.[slayer]?.xp ?? 0
	}

	getSlayerBossKills(slayer: string, tier: number) {
		return this.raw.slayer?.slayer_bosses?.[slayer]?.[`boss_kills_tier_${tier - 1}`] ?? 0
	}

	getTrophyFish(fish: string, tier: string) {
		return this.raw.trophy_fish?.[`${fish}_${tier}`] ?? 0
	}

	getDungeonXp() {
		return this.raw.dungeons?.dungeon_types?.catacombs?.experience ?? 0
	}

	getDungeonData(dungeon: "catacombs" | "master_catacombs", floor: number) {
		const mode = this.raw.dungeons?.dungeon_types?.[dungeon]
		if (!mode) return null
		const fastestTime = mode?.fastest_time[floor]
		const fastestTimeS = mode?.fastest_time_s[floor]
		const fastestTimeSPlus = mode?.fastest_time_s_plus[floor]
		const tierCompletions = mode?.tier_completions[floor]
		const milestoneCompletions = mode?.milestone_completions[floor]
		return {
			fastestTime,
			fastestTimeS,
			fastestTimeSPlus,
			tierCompletions,
			milestoneCompletions
		}
	}

	getDungeonSecrets() {
		return this.raw.dungeons?.secrets ?? 0
	}

	getDungeonClassXp(dungeonClass: "healer" | "tank" | "berserk" | "archer" | "mage") {
		return this.raw.dungeons?.player_classes?.[dungeonClass]?.experience ?? 0
	}
}
