import type { SkyblockMember } from "../hypixel/skyblock/SkyblockMember"
import type { NeuLevelingJson } from "../types/NeuLevelingJson"
import { LevelResolver } from "../utils/LevelResolver"

export type SkillName =
	| "taming"
	| "mining"
	| "foraging"
	| "enchanting"
	| "carpentry"
	| "farming"
	| "combat"
	| "fishing"
	| "alchemy"
	| "runecrafting"
	| "social"

interface SkillInfo {
	xp: number
	level: number
	maxLevel: number
	xpForMax: number
	xpForNextLevel: number
	progress: number
}

export class NeuSkillLevels {
	private readonly resolvers: Map<SkillName, LevelResolver>
	private readonly caps: Map<SkillName, number>

	constructor(json: NeuLevelingJson) {
		this.resolvers = new Map()
		this.caps = new Map()

		const standardSkills: SkillName[] = [
			"taming",
			"mining",
			"foraging",
			"enchanting",
			"carpentry",
			"farming",
			"combat",
			"fishing",
			"alchemy"
		]

		for (const skill of standardSkills) {
			this.resolvers.set(skill, LevelResolver.fromCumulative(json.leveling_xp))
			this.caps.set(skill, json.leveling_caps[skill])
		}

		this.resolvers.set("runecrafting", LevelResolver.fromCumulative(json.runecrafting_xp))
		this.caps.set("runecrafting", json.leveling_caps.runecrafting)

		this.resolvers.set("social", LevelResolver.fromCumulative(json.social))
		this.caps.set("social", json.leveling_caps.social)
	}

	public getSkills(): SkillName[] {
		return [...this.resolvers.keys()]
	}

	public getSkillInfo(skill: SkillName, member: SkyblockMember) {
		return {
			name: skill,
			info: this.getSkill(skill, member)
		}
	}

	private getSkill(skill: SkillName, member: SkyblockMember): SkillInfo {
		const resolver = this.resolvers.get(skill)
		if (resolver == null) throw new Error(`Unknown skill ${skill}`)

		const defaultCap = this.caps.get(skill)
		if (defaultCap == null) throw new Error(`No default cap for skill ${skill}`)

		const effectiveCap = defaultCap + member.getLevelCap(skill)

		const xp = member.getSkillXp(skill)
		const info = resolver.resolve(xp, effectiveCap)

		return {
			xp,
			level: info.level,
			maxLevel: info.maxLevel,
			xpForMax: info.maxValue,
			xpForNextLevel: info.nextLevelAt,
			progress: info.progress
		}
	}
}
