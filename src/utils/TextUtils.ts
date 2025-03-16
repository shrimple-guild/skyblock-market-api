import romans from "romans"

/**
 * Removes Minecraft formatting codes from a given text.
 *
 * @param {string} text - The input text containing formatting codes.
 * @returns {string} The cleaned text without formatting codes.
 */
function removeFormatting(text: string): string {
	return text.replace(/\u00A7[0-9A-FK-OR]/gi, "")
}

/**
 * Converts a given text to snake_case.
 * Spaces are replaced with underscores, and all letters are converted to lowercase.
 *
 * @param {string} text - The input text to be converted.
 * @returns {string} The snake_case version of the input text.
 */
function toSnakeCase(text: string): string {
	return text.replace(/\s+/g, "_").toLowerCase()
}

/**
 * Converts a given text to Title Case.
 * Removes underscores. Then, each word's first letter is capitalized, and the rest
 * are converted to lowercase.
 *
 * @param {string} text - The input text to be converted.
 * @returns {string} The title-cased version of the input text.
 */
function toTitleCase(text: string): string {
	return text.replaceAll("_", " ").replace(/\w\S*/g, (txt) => {
		return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
	})
}

function stripNonAscii(text: string): string {
	return text.replace(/[^\x00-\x7F]/g, "")
}

function attemptDeromanize(text: string): string {
	try {
		return romans.deromanize(text.toUpperCase()).toString()
	} catch (e) {
		return text
	}
}

function attemptDeromanizeAll(text: string): string {
	return text
		.split(" ")
		.map((text) => attemptDeromanize(text))
		.join(" ")
}

function attemptDeromanizeLast(text: string): string {
	const split = text.split(" ")
	if (split.length <= 1) return text
	const last = attemptDeromanize(split.pop()!!)
	split.push(last)
	return split.join(" ")
}

function clean(text: string): string {
	return stripNonAscii(removeFormatting(text)).trim()
}

function naturalSort(first: string, second: string): number {
	const firstGroups = first.split(/(\d+)/)
	const secondGroups = second.split(/(\d+)/)
	const minLength = Math.min(firstGroups.length, secondGroups.length)
	for (let g = 0; g < minLength; g++) {
		const comp =
			g % 2 == 0
				? firstGroups[g].localeCompare(secondGroups[g])
				: parseInt(firstGroups[g]) - parseInt(secondGroups[g])
		if (comp != 0) return comp
	}
	if (firstGroups.length > secondGroups.length) {
		return 1
	} else if (firstGroups.length == secondGroups.length) {
		return 0
	} else {
		return -1
	}
}

export const TextUtils = {
	removeFormatting,
	toSnakeCase,
	toTitleCase,
	stripNonAscii,
	attemptDeromanize,
	attemptDeromanizeAll,
	attemptDeromanizeLast,
	clean,
	naturalSort
}
