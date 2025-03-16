import { describe, it, expect } from "bun:test"
import rawProfiles from "./data/skyblockprofiles.json"
import { SkyblockProfiles } from "../src/skyblock/SkyblockProfiles"
import type { ApiSkyblockProfile } from "../src/types/ApiSkyblockProfilesResponse"

// @ts-expect-error - doesn't appear possible to type skyblock members fully correctly
// https://github.com/microsoft/TypeScript/issues/17867
const profilesData: ApiSkyblockProfile[] = rawProfiles.profiles
const profiles = new SkyblockProfiles("59998433ceda41c1b0acffe7d9b33594", profilesData)

describe("SkyblockProfiles", () => {
	it("should get main profile", () => {
			const mainProfile = profiles.getMainProfile()
            expect(mainProfile.getName()).toBe("Orange")
    })

    it("should get bingo profile", () => {
        const bingoProfile = profiles.getBingoProfile()
        expect(bingoProfile).not.toBeNull()
        expect(bingoProfile!!.getGamemode()).toBe("bingo")
        expect(bingoProfile!!.getName()).toBe("Pomegranate")

    })

    it("should get selected profile", () => {
        const selectedProfile = profiles.getSelectedProfile()
        expect(selectedProfile).not.toBeNull()
        expect(selectedProfile!!.isSelected()).toBe(true)
        expect(selectedProfile!!.getName()).toBe("Orange")
    })

    it("should get by queries", () => {
        expect(profiles.getByQuery("MAIN")?.getName()).toBe("Orange")
        expect(profiles.getByQuery("BiNgO")?.getName()).toBe("Pomegranate")
        expect(profiles.getByQuery("selected")?.getName()).toBe("Orange")
        expect(profiles.getByQuery("BLUEBERRY")?.getName()).toBe("Blueberry")
        expect(profiles.getByQuery("blueberry")?.getName()).toBe("Blueberry")
    })
})
