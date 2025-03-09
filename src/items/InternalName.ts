import nbt, { simplify, type NBT } from "prismarine-nbt"

function resolveFromBazaarId(id: string) {
	const enchantRegex = /ENCHANTMENT_(\D+)_(\d+)/
	const match = enchantRegex.exec(id)
	if (match) {
		return `${match[1]};${match[2]}`
	}
	return id.replaceAll(":", "-")
}

function resolveFromBytes(itemBytes: string) {
	const buffer = Buffer.from(itemBytes, "base64")
	const unzipped = Bun.gunzipSync(new Uint8Array(buffer))
	const parsed = nbt.parseUncompressed(Buffer.from(unzipped), "big")
	const itemName = resolveFromNbt(parsed)
	return itemName
}

function resolveFromNbt(tag: NBT): string {
	const simplified = simplify(tag)
	const itemTag = simplified.i[0].tag
	const extraAttributes = itemTag.ExtraAttributes
	const skyblockId = extraAttributes.id ?? ""

	switch (skyblockId) {
		case "PET":
			return resolvePet(extraAttributes, itemTag)
		case "ATTRIBUTE_SHARD":
			return resolveAttributeShard(extraAttributes)
		case "RUNE":
		case "UNIQUE_RUNE":
			return resolveRune(extraAttributes)
		case "POTION":
			return resolvePotion(extraAttributes)
		case "ABICASE":
			return resolveAbicase(extraAttributes)
		case "PARTY_HAT_CRAB":
			return resolveColoredPartyHat("PARTY_HAT_CRAB", extraAttributes)
		case "PARTY_HAT_CRAB_ANIMATED":
			return resolveColoredPartyHat("PARTY_HAT_CRAB", extraAttributes, "_ANIMATED")
		case "PARTY_HAT_SLOTH":
			return resolveSlothHat(extraAttributes)
		case "BALLOON_HAT_2024":
			return resolveColoredPartyHat("BALLOON_HAT_2024", extraAttributes)
		default:
			return skyblockId
	}
}

function resolvePet(extraAttributes: any, itemTag: any): string {
	const petTag = JSON.parse(extraAttributes.petInfo)
	const tier = getTier(petTag.tier)
	const levelRegex = /§7\[Lvl (\d{1,3})\].*/.exec(itemTag.display.Name)
	const level = levelRegex ? parseInt(levelRegex[1]) : 0
	const maxLevel = petTag.type == "GOLDEN_DRAGON" ? 200 : 100
	const bonus = level == maxLevel ? "+MAX" : ""
	return `${petTag.type};${tier}${bonus}`
}

function getTier(tier: string): number {
	switch (tier) {
		case "COMMON":
			return 0
		case "UNCOMMON":
			return 1
		case "RARE":
			return 2
		case "EPIC":
			return 3
		case "LEGENDARY":
			return 4
		case "MYTHIC":
			return 5
		default:
			throw new Error(`Unknown tier: ${tier}`)
	}
}

function resolveAttributeShard(extraAttributes: any): string {
	const attributes = extraAttributes.attributes
	let [name, tier] = Object.entries(attributes)[0] as [string, number]
	return `ATTRIBUTE_SHARD_${name.toUpperCase()};${tier}`
}

function resolveRune(extraAttributes: any): string {
	const runes = extraAttributes.runes
	let [name, tier] = Object.entries(runes)[0] as [string, number]
	return `${name.toUpperCase()}_RUNE;${tier}`
}

function resolveColoredPartyHat(hat: string, extraAttributes: any, suffix: string = ""): string {
	const color = extraAttributes.party_hat_color.toUpperCase()
	return `${hat}_${color}${suffix}`
}

function resolveSlothHat(extraAttributes: any): string {
	const emoji = extraAttributes.party_hat_emoji.toUpperCase()
	return `PARTY_HAT_SLOTH_${emoji}`
}

function resolveAbicase(extraAttributes: any): string {
	return `${extraAttributes.id}_${extraAttributes.model}`
}

function resolvePotion(extraAttributes: any): string {
	const level = extraAttributes.potion_level
	const potion = extraAttributes.potion.toUpperCase()
	return `POTION_${potion};${level}`
}

export const InternalName = { resolveFromBytes, resolveFromBazaarId }
