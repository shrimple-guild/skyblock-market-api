import { Parser } from "tar"
import { Readable } from "stream"
import path from "path"
import type { NeuItemJson } from "../types/NeuItemJson"
import { TextUtils } from "../TextUtils"
import { ItemNameResolver } from "./ItemNameResolver"

export class NeuItemService {
	private readonly org: string
	private readonly repo: string
	private readonly branch: string
	private readonly dir: string
	private hasLoaded: boolean
	private items: NeuItemJson[]

	constructor(org: string, repo: string, branch: string, dir: string) {
		this.repo = repo
		this.org = org
		this.branch = branch
		this.dir = dir
		this.hasLoaded = false
		this.items = []
	}

	getItemResolver() {
		return new ItemNameResolver(this.items)
	}

	async load() {
		const promises = [this.getLocalCommit(), this.fetchLatestCommit()]
		const [localCommit, remoteCommit] = await Promise.all(promises)
		let shouldLoadTar = !this.hasLoaded
		if (remoteCommit != localCommit) {
			await this.downloadTar(remoteCommit)
			shouldLoadTar = true
		}
		if (!shouldLoadTar) {
			return
		}
		const entries = await this.fetchRepoEntries()
		this.items = []
		for (const entry of entries) {
			const path = this.splitFileName(entry.path)
			if (path.extension != "json") continue
			if (path.directory == "items") {
				this.items.push(this.bufferToJson(entry.content))
			}
		}
		this.hasLoaded = true
	}

	private async fetchLatestCommit(): Promise<string> {
		const commitApiUrl = `https://api.github.com/repos/${this.org}/${this.repo}/commits/${this.branch}`
		const response = await fetch(commitApiUrl)
		if (!response.ok) throw new Error(`Failed to fetch commit data: ${response.statusText}`)

		const data = (await response.json()) as ApiCommitResponse
		return data.sha
	}

	private async downloadTar(commit: string): Promise<ArrayBuffer> {
		const tarballUrl = `https://api.github.com/repos/${this.org}/${this.repo}/tarball/${commit}`
		const response = await fetch(tarballUrl)
		if (!response.ok) throw new Error(`Failed to fetch tarball: ${response.statusText}`)
		const arrayBuffer = await response.arrayBuffer()
		await Bun.write(this.getNeuRepoPath(), arrayBuffer)
		await Bun.write(this.getCommitHashPath(), commit)
		return arrayBuffer
	}

	private async fetchRepoEntries(): Promise<TarEntry[]> {
		const file = Bun.file(this.getNeuRepoPath())
		const buffer = Buffer.from(await file.arrayBuffer())
		return new Promise((resolve, reject) => {
			const parseStream = new Parser()
			const entries: TarEntry[] = []

			parseStream.on("entry", (entry: any) => {
				const chunks: Buffer[] = []
				entry.on("data", (chunk: Buffer) => chunks.push(chunk))
				entry.on("end", () => entries.push({ path: entry.path, content: Buffer.concat(chunks) }))
			})

			parseStream.on("end", () => resolve(entries))
			parseStream.on("error", (error: any) => reject(error))

			const bufferStream = new Readable()
			bufferStream.pipe(parseStream)
			bufferStream.push(buffer)
			bufferStream.push(null)
		})
	}

	private getNeuRepoPath() {
		return path.join(this.dir, "neu-repo.tar.gz")
	}

	private getCommitHashPath() {
		return path.join(this.dir, "neu-commit-hash.txt")
	}

	private async getLocalCommit(): Promise<string> {
		const commitFile = Bun.file(this.getCommitHashPath())
		const exists = await commitFile.exists()
		if (!exists) return "[none]"
		return commitFile.text()
	}

	private splitFileName(filePath: string): FilePath {
		const directory = path.dirname(filePath).split(path.sep).pop() || ""
		const extension = path.extname(filePath).slice(1)
		const name = path.basename(filePath, path.extname(filePath))
		return {
			directory,
			name,
			extension
		}
	}

	private bufferToJson(buffer: Buffer): any {
		return JSON.parse(buffer.toString("utf-8"))
	}
}

interface ApiCommitResponse {
	sha: string
}

type FilePath = {
	directory: string
	name: string
	extension: string
}

type TarEntry = {
	path: string
	content: Buffer
}
