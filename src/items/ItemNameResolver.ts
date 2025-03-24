import { TextUtils } from "../utils/TextUtils"
import type { NeuItemJson } from "../types/NeuItemJson"
import type { SkyblockItemJson } from "../types/SkyblockItemJson"

/**
 * Converts NEU internal names into display names, which are names that describe the item for search and retrieval.
 * This is not the same as the item name as it appears in Hypixel: it does not have color codes and may use extra
 * words to disambiguate items.
 * 
 * Primarily uses the NEU repo to convert display names. For the case where items do not yet exist in the NEU repository,
 * the Skyblock items endpoint is a fallback.
 */
export class ItemNameResolver {
	private items: Map<string, ItemName>
	private static RARITIES = ["Common", "Uncommon", "Rare", "Epic", "Legendary", "Mythic"]

	constructor(neuItems: NeuItemJson[], skyblockItems: SkyblockItemJson[]) {
		this.items = new Map()

		for (const skyblockItem of skyblockItems) {
			this.items.set(skyblockItem.id, { 
				displayName: skyblockItem.name, 
				internalName: skyblockItem.id
			})
		}

		for (const neuItem of neuItems) {
			const internalName = neuItem.internalname
			if (this.isItem(internalName)) {
				const displayName = this.getDisplayNameFromJson(neuItem)
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
					displayName: `Level ${level} ${item.displayName}`
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
	GOD_POTION: "God Potion (Legacy)",
	SALMON_HELMET: "Salmon Helmet (Legacy)",
	SALMON_CHESTPLATE: "Salmon Chestplate (Legacy)",
	SALMON_LEGGINGS: "Salmon Leggings (Legacy)",
	SALMON_BOOTS: "Salmon Boots (Legacy)",
	SUPERIOR_BABY: "Superior Dragon Helmet Baby Skin",
	STRONG_BABY: "Strong Dragon Helmet Baby Skin",
	UNSTABLE_BABY: "Unstable Dragon Helmet Baby Skin",
	YOUNG_BABY: "Young Dragon Helmet Baby Skin",
	OLD_BABY: "Old Dragon Helmet Baby Skin",
	WISE_BABY: "Wise Dragon Helmet Baby Skin",
	PROTECTOR_BABY: "Protector Dragon Helmet Baby Skin",
	HOLY_BABY: "Holy Dragon Helmet Baby Skin",
	GOBLIN_HELMET_BABY: "Goblin Helmet Baby Skin",
	SUPERIOR_SHIMMER: "Superior Dragon Helmet Shimmer Skin",
	STRONG_SHIMMER: "Strong Dragon Helmet Shimmer Skin",
	UNSTABLE_SHIMMER: "Unstable Dragon Helmet Shimmer Skin",
	YOUNG_SHIMMER: "Young Dragon Helmet Shimmer Skin",
	OLD_SHIMMER: "Old Dragon Helmet Shimmer Skin",
	WISE_SHIMMER: "Wise Dragon Helmet Shimmer Skin",
	PROTECTOR_SHIMMER: "Protector Dragon Helmet Shimmer Skin",
	HOLY_SHIMMER: "Holy Dragon Helmet Shimmer Skin",
	ABIPHONE_XIV_ENORMOUS: "Abiphone 14 Enormous",
	ABIPHONE_XIV_ENORMOUS_BLACK: "Abiphone 14 Enormous (Black)",
	ABIPHONE_XIV_ENORMOUS_PURPLE: "Abiphone 14 Enormous (Purple)",
	UPGRADE_STONE_FROST: "Frost Wisp Upgrade Stone",
	UPGRADE_STONE_GLACIAL: "Glacial Wisp Upgrade Stone",
	UPGRADE_STONE_SUBZERO: "Subzero Wisp Upgrade Stone",
	GRIFFIN_UPGRADE_STONE_UNCOMMON: "Uncommon Griffin Upgrade Stone",
	GRIFFIN_UPGRADE_STONE_RARE: "Rare Griffin Upgrade Stone",
	GRIFFIN_UPGRADE_STONE_EPIC: "Epic Griffin Upgrade Stone",
	GRIFFIN_UPGRADE_STONE_LEGENDARY: "Legendary Griffin Upgrade Stone",
	BEASTMASTER_CREST_COMMON: "Common Beastmaster Crest",
	BEASTMASTER_CREST_UNCOMMON: "Uncommon Beastmaster Crest",
	BEASTMASTER_CREST_RARE: "Rare Beastmaster Crest",
	BEASTMASTER_CREST_EPIC: "Epic Beastmaster Crest",
	BEASTMASTER_CREST_LEGENDARY: "Legendary Beastmaster Crest"
}
