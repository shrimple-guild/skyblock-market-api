import { TextUtils } from "../TextUtils"
import type { NeuItemJson } from "../types/NeuItemJson"

export class ItemNameResolver {
	private items: Map<string, ItemName | undefined>
	private static RARITIES = ["Common", "Uncommon", "Rare", "Epic", "Legendary", "Mythic"]

	constructor(items: NeuItemJson[]) {
		this.items = new Map()
		for (const json of items) {
			const internalName = json.internalname
			if (this.isItem(internalName)) {
				this.items.set(internalName, {
					displayName: this.getDisplayNameFromJson(json),
					internalName: internalName
				})
			}
		}
	}

	resolve(internalName: string): ItemName {
		const [name, extraData] = internalName.split("+")
		const item = this.items.get(name)
		if (item) {
			if (extraData == "MAX") {
				const level = item.internalName == "GOLDEN_DRAGON;4" ? 200 : 100
				return {
					internalName: `${item.internalName}+MAX`,
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
    "GOD_POTION": "God Potion (Legacy)"
}