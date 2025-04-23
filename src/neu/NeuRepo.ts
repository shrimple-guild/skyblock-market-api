import { Glob } from "bun"
import type { NeuItemJson } from "../types/NeuItemJson"
import type { RepoFile } from "./NeuRepoFile"

export class NeuRepo {
	private files: RepoFile[]

	constructor(files: RepoFile[]) {
		this.files = files
	}

	getConstant<T>(name: string): T | null {
		const path = `constants/${name}.json`
		return this.files.find((file) => file.path == path)?.toJson<T>() ?? null
	}

	getItems(): NeuItemJson[] {
		const itemGlob = new Glob("items/*.json")
		const itemFiles = this.files.filter((file) => file.matches(itemGlob))
		const itemJson = itemFiles.map((file) => file.toJson<NeuItemJson>())
		return itemJson
	}
}
