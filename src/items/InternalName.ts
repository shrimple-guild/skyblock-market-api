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
	const extraAttributes = simplified.i[0].tag.ExtraAttributes
	const skyblockId = extraAttributes.id ?? ""

	switch (skyblockId) {
		case "PET":
			return resolvePet(extraAttributes)
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

function resolvePet(extraAttributes: any): string {
	const petTag = JSON.parse(extraAttributes.petInfo)
	const { tier, maxXp } = getTierInfo(petTag.tier)
	const bonus = petTag.exp >= maxXp ? "+MAX" : ""
	return `${petTag.type};${tier}${bonus}`
}

function getTierInfo(tier: string): { tier: number; maxXp: number } {
	switch (tier) {
		case "COMMON":
			return { tier: 0, maxXp: 5624785 }
		case "UNCOMMON":
			return { tier: 1, maxXp: 8644220 }
		case "RARE":
			return { tier: 2, maxXp: 12626665 }
		case "EPIC":
			return { tier: 3, maxXp: 18608500 }
		case "LEGENDARY":
			return { tier: 4, maxXp: 25353230 }
		case "MYTHIC":
			return { tier: 5, maxXp: 25353230 }
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
