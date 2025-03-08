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
		const name = this.items.get(internalName)
		if (name) return name
		const displayName = internalName
			.split(/[;_]/)
			.map((str) => TextUtils.toTitleCase(str))
			.join(" ")
		return { internalName, displayName }
	}

	private getDisplayNameFromJson(itemData: NeuItemJson) {
		let cleaned = TextUtils.removeFormatting(itemData.displayname)
		cleaned = TextUtils.stripNonAscii(cleaned).trim()

		// handle old god pots
		// TODO make this a data file or maybe even an endpoint to control
		if (itemData.internalname == "GOD_POTION_2") {
			return "God Potion (Legacy)"
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

		// handle enchanted book display names
		if (cleaned == "Enchanted Book") {
			const [name, level] = itemData.internalname.split(";")
			return `${TextUtils.toTitleCase(name)} ${level} Enchanted Book`
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
