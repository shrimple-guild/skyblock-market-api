const standardPattern = /^[0-9a-f]{8}-?[0-9a-f]{4}-?4[0-9a-f]{3}-?[89ab][0-9a-f]{3}-?[0-9a-f]{12}$/i
const compactPattern = /^[0-9a-f]{12}4[0-9a-f]{3}[89ab][0-9a-f]{15}$/i

function isValid(uuid: string): boolean {
	if (uuid.length === 36) {
		return standardPattern.test(uuid)
	}

	if (uuid.length === 32) {
		return compactPattern.test(uuid)
	}

	return false
}

function compact(uuid: string): string {
	if (!isValid(uuid)) {
		throw new Error("Invalid UUIDv4 format")
	}
	return uuid.replaceAll("-", "").toLowerCase()
}

function standard(uuid: string): string {
	const c = compact(uuid)
	return `${c.slice(0, 8)}-${c.slice(8, 12)}-${c.slice(12, 16)}-${c.slice(16, 20)}-${c.slice(20)}`
}

export const UuidUtils = { isValid, compact, standard }
