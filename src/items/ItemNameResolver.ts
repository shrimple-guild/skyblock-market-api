import { TextUtils } from "../TextUtils"
import type { NeuItemJson } from "../types/NeuItemJson"

export class ItemNameResolver {
	private items: Map<string, ItemName>
	private static RARITIES = ["Common", "Uncommon", "Rare", "Epic", "Legendary", "Mythic"]
	static EMPTY = new ItemNameResolver([])

	constructor(items: NeuItemJson[]) {
		this.items = new Map()
		for (const json of items) {
			const internalName = json.internalname
			if (this.isItem(internalName)) {
				const displayName = this.getDisplayNameFromJson(json)
				this.items.set(internalName, { displayName, internalName })
			}
		}
	}

	checkForDuplicateDisplayNames(): Map<string, string[]> {
		const duplicateNameCheck = new Map<string, string[]>()
		for (const item of this.items.values()) {
			const arr = duplicateNameCheck.get(item.displayName) ?? []
			arr.push(item.internalName)
			duplicateNameCheck.set(item.displayName, arr)
		}
		for (const [displayName, internalNames] of duplicateNameCheck.entries()) {
			if (internalNames.length < 2) {
				duplicateNameCheck.delete(displayName)
			}
		}
		return duplicateNameCheck
	}

	resolve(internalName: string): ItemName {
		const [name, extraData] = internalName.split("+")
		const item = this.items.get(name)
		if (item) {
			if (extraData == "MAX") {
				const level = item.internalName == "GOLDEN_DRAGON;4" ? 200 : 100
				return {
					internalName: internalName,
					displayName: `[Lvl ${level}] ${item.displayName}`
				}
			}
			return item
		}
		const displayName = internalName
			.split(/[;_]/)
			.map((str) => TextUtils.toTitleCase(str))
			.join(" ")
		return { internalName, displayName }
	}

	private getDisplayNameFromJson(itemData: NeuItemJson) {
		let cleaned = TextUtils.clean(itemData.displayname)

		let itemName = irregularItemNames[itemData.internalname]
		if (itemName) return itemName

		if (itemData.internalname.startsWith("STARRED_")) {
			return `Starred ${cleaned}`
		}

		// handle items with rarity suffix
		const beastmasterMatcher = /(BEASTMASTER_CREST|GRIFFIN_UPGRADE_STONE)_(\w+)/.exec(itemData.internalname)
		if (beastmasterMatcher) {
			const rarity = TextUtils.toTitleCase(beastmasterMatcher[2])
			return `${rarity} ${cleaned}`
		}

		// handle baby skins
		const babyMatcher = /(\w+?)(_HELMET)?_BABY/.exec(itemData.internalname)
		if (cleaned == "Baby Skin" && babyMatcher) {
			const suffix = babyMatcher[2] ? "" : "Dragon "
			return TextUtils.toTitleCase(`${babyMatcher[1]} ${suffix}Helmet Baby Skin`)
		}

		// handle abiphones
		const abiphoneMatcher = /ABIPHONE_XIV_ENORMOUS(?:_(\w+))?/.exec(itemData.internalname)
		if (abiphoneMatcher) {
			const suffix = abiphoneMatcher[1] ? ` (${TextUtils.toTitleCase(abiphoneMatcher[1])})` : ""
			return `${cleaned}${suffix}`
		}

		// handle shimmer skins
		const shimmerMatcher = /(\w+)_SHIMMER/.exec(itemData.internalname)
		if (shimmerMatcher) {
			return TextUtils.toTitleCase(`${shimmerMatcher[1]} Dragon Helmet Shimmer Skin`)
		}

		// handle wisp upgrade stones
		const wispMatcher = /UPGRADE_STONE_(\w+)/.exec(itemData.internalname)
		if (wispMatcher) {
			return TextUtils.toTitleCase(`${wispMatcher[1]} Wisp Upgrade Stone`)
		}

		// handle mathematical hoes
		const hoeMatcher = /THEORETICAL_HOE_\w+_(\d)/.exec(itemData.internalname)
		if (hoeMatcher) {
			return `${cleaned} (T${hoeMatcher[1]})`
		}

		// handle skill exp boost pet items
		const petItemMatcher = /PET_ITEM_(\w+)_SKILL_BOOST_(\w+)/.exec(itemData.internalname)
		if (petItemMatcher) {
			return TextUtils.toTitleCase(`${petItemMatcher[2]} ${petItemMatcher[1]} Exp Boost`)
		}

		// handle pet display names
		const petMatcher = /\[Lvl {LVL}\] (.+)/.exec(cleaned)
		if (petMatcher) {
			const petName = petMatcher[1]
			const petRarityNum = parseInt(itemData.internalname.split(";")[1])
			const rarity = ItemNameResolver.RARITIES[petRarityNum]
			return `${rarity} ${petName}`
		}

		// handle attribute display names
		const attributeMatcher = /ATTRIBUTE_SHARD_(\D+);(\d+)/.exec(itemData.internalname)
		if (attributeMatcher) {
			return `${TextUtils.toTitleCase(attributeMatcher[1])} ${attributeMatcher[2]} Attribute Shard`
		}

		// handle enchanted book bundles
		const bookBundleMatcher = /ENCHANTED_BOOK_BUNDLE_(\w+)/.exec(itemData.internalname)
		if (bookBundleMatcher) {
			const name = TextUtils.toTitleCase(TextUtils.attemptDeromanizeLast(TextUtils.clean(itemData.lore[0])))
			return `${name} Enchanted Book Bundle`
		}

		// handle enchanted book display names
		if (cleaned == "Enchanted Book") {
			const name = TextUtils.toTitleCase(TextUtils.attemptDeromanizeLast(TextUtils.clean(itemData.lore[0])))
			return `${name} Enchanted Book`
		}

		return TextUtils.attemptDeromanizeLast(cleaned)
	}

	private isItem(internalName: string) {
		const mobRegex = /.*?((_MONSTER)|(_NPC)|(_ANIMAL)|(_MINIBOSS)|(_BOSS)|(_SC))$/
		const isMob = mobRegex.test(internalName)
		return !isMob
	}
}

export type ItemName = {
	displayName: string
	internalName: string
}

const irregularItemNames: Record<string, string | undefined> = {
	"GOD_POTION": "God Potion (Legacy)",
	"SALMON_HELMET": "Salmon Helmet (Legacy)",
	"SALMON_CHESTPLATE": "Salmon Chestplate (Legacy)",
	"SALMON_LEGGINGS": "Salmon Leggings (Legacy)",
	"SALMON_BOOTS": "Salmon Boots (Legacy)",
}
