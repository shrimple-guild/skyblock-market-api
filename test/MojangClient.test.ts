import { describe, expect, beforeEach, it } from "bun:test"
import { MojangClient } from "../src/mojang/MojangClient"

describe("MojangClient", () => {
	let client: MojangClient

	beforeEach(() => {
		client = new MojangClient()
	})

	it("should retrieve a Mojang player by valid compact UUID", async () => {
		const uuid = "6ab4317889fd490597f60f67d9d76fd9"
		const player = await client.get(uuid)
		expect(player?.uuid).toBe("6ab43178-89fd-4905-97f6-0f67d9d76fd9")
		expect(player?.name).toBe("MHF_Alex")
	})

	it("should retrieve a Mojang player by valid standard UUID", async () => {
		const uuid = "c06f8906-4c8a-4911-9c29-ea1dbd1aab82"
		const player = await client.get(uuid)
		expect(player?.uuid).toBe(uuid)
		expect(player?.name).toBe("MHF_Steve")
	})

	it("should retrieve a Mojang player by name", async () => {
		const name = "MHF_Enderman"
		const player = await client.get(name)
		expect(player?.uuid).toBe("40ffb372-12f6-4678-b3f2-2176bf56dd4b")
		expect(player?.name).toBe("MHF_Enderman")
	})

	it("should return null for nonexistent player", async () => {
		const invalidQuery = "fTNcTvNTahfa0vHL"
		const result = await client.get(invalidQuery)
		expect(result).toBeNull()
	})
})
