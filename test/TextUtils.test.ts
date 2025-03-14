import { describe, it, expect } from "bun:test"
import { TextUtils } from "../src/TextUtils"

describe("naturalSort", () => {
    it("should compare normal strings", () => {
        const strings = ["abc", "abca", "abcd", "aardvark", "a"]
        const comp = strings.toSorted(TextUtils.naturalSort)
        expect(comp).toEqual(["a", "aardvark", "abc", "abca", "abcd"])
        console.log(comp)
    })

    it("should compare numeric strings", () => {
        const strings = ["50", "21494", "3", "593", "32", "43"]
        const comp = strings.toSorted(TextUtils.naturalSort)
        expect(comp).toEqual(["3", "32", "43", "50", "593", "21494"])
        console.log(comp)
    })

    it("should compare mixed strings", () => {
        const strings = ["abc10", "abc2b", "abc1", "abc2a", "abc2"]
        const comp = strings.toSorted(TextUtils.naturalSort)
        expect(comp).toEqual(["abc1", "abc2", "abc2a", "abc2b", "abc10"])
        console.log(comp)
    })
})
