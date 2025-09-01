import type { SkyblockMember } from "../hypixel/skyblock/SkyblockMember"
import { LevelResolver } from "../utils/LevelResolver"
import { TextUtils } from "../utils/TextUtils"

type NeuBestiaryJson = any

interface NeuBestiaryFamilyJson {
	name: string
	category: string
	cap: number
	mobs: string[]
	bracket: number
}

type BestiaryFamilyInfo = {
	kills: number
	deaths: number
	tier: number
	maxTier: number
	killsForMax: number
	killsForNextTier: number
	progress: number
}

class NeuBestiaryFamily {
	readonly name: string
	private readonly levelResolver: LevelResolver
	private readonly mobs: string[]

	constructor(json: NeuBestiaryFamilyJson, brackets: Map<number, number[]>) {
		this.name = TextUtils.removeFormatting(json.name)

		const curve = brackets.get(json.bracket)
		if (!curve) {
			throw new Error(`No bracket ${json.bracket} found.`)
		}

		this.levelResolver = LevelResolver.fromCumulativeMaxValue(curve, json.cap)
		this.mobs = json.mobs
	}

	public getLevel(member: SkyblockMember): BestiaryFamilyInfo {
		let kills = 0
		let deaths = 0

		for (const mob of this.mobs) {
			kills += member.getBestiaryKills(mob)
			deaths += member.getBestiaryDeaths(mob)
		}

		const info = this.levelResolver.resolve(kills)

		return {
			kills,
			deaths,
			tier: info.level,
			maxTier: info.maxLevel,
			killsForMax: info.maxValue,
			killsForNextTier: info.nextLevelAt,
			progress: info.progress
		}
	}
}

export class NeuBestiary {
	private readonly families: NeuBestiaryFamily[]

	constructor(json: NeuBestiaryJson) {
		const jsonValues: any[] = Object.values(json)
		const brackets: Map<number, number[]> = new Map()
		this.families = []

		const bracketData = jsonValues.shift()

		for (const [bracket, tiers] of Object.entries(bracketData)) {
			brackets.set(parseInt(bracket), tiers as number[])
		}

		const flattened: NeuBestiaryFamilyJson[] = []

		for (const category of jsonValues) {

			if (category.hasSubcategories) {
				for (const subcategory of Object.values(category) as any[]) {
					if (subcategory.mobs) {
						for (const family of subcategory.mobs) {
							family.category = category.name
							flattened.push(family)
						}
					}
				}
			} else if (category.mobs) {
				for (const family of category.mobs) {
					family.category = category.name
					flattened.push(family)
				}
			}
		}

		const nameCounts = new Map<string, number>()

		for (const family of flattened) {
			nameCounts.set(family.name, (nameCounts.get(family.name) || 0) + 1)
		}

		for (const family of flattened) {
			if ((nameCounts.get(family.name) ?? 0) > 1) {
				family.name = `${family.name} (${family.category})`
			}
			this.families.push(new NeuBestiaryFamily(family, brackets))
		}
	}

	public getBestiaryFamilies() {
		return this.families.map((family) => family.name)
	}

	public getBestiary(familyName: string, member: SkyblockMember) {
		const family = this.families.find((f) => f.name == familyName)
		if (!family) return null

		return {
			name: family.name,
			info: family.getLevel(member)
		}
	}
}
