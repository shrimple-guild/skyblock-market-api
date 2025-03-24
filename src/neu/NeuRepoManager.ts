import { Parser } from "tar"
import { Readable } from "stream"
import path from "path"
import type { ApiCommitResponse, NeuRepositoryListener } from "./types"
import { NeuRepo } from "./NeuRepo"
import { RepoFile } from "./NeuRepoFile"

export class NeuRepoManager {
    private readonly org: string
    private readonly repo: string
    private readonly branch: string
    private readonly dir: string
    private isLoaded: boolean
    private listeners: NeuRepositoryListener[]

    constructor(org: string, repo: string, branch: string, dir: string) {
        this.repo = repo
        this.org = org
        this.branch = branch
        this.dir = dir
        this.isLoaded = false
        this.listeners = []
    }

    async load() {
        const promises = [this.getLocalCommit(), this.fetchLatestCommit()]
        const [localCommit, remoteCommit] = await Promise.all(promises)

        if (remoteCommit != localCommit) {
            await this.downloadTar(remoteCommit)
            this.isLoaded = false
        }

        if (!this.isLoaded) {
            const repository = new NeuRepo(await this.fetchRepoFiles())
            this.notifyListeners(repository)
        }
    }

    addListener(listener: NeuRepositoryListener) {
        this.listeners.push(listener)
    }

    private notifyListeners(repository: NeuRepo) {
        for (const listener of this.listeners) {
            listener(repository)
        }
    }

    private async fetchLatestCommit(): Promise<string> {
        const commitApiUrl = `https://api.github.com/repos/${this.org}/${this.repo}/commits/${this.branch}`
        const response = await fetch(commitApiUrl)
        if (!response.ok) throw new Error(`Failed to fetch commit data: ${response.statusText}`)

        const data: ApiCommitResponse = await response.json() 
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

    private async fetchRepoFiles(): Promise<RepoFile[]> {
        const file = Bun.file(this.getNeuRepoPath())
        const buffer = Buffer.from(await file.arrayBuffer())
        return new Promise((resolve, reject) => {
            const parseStream = new Parser()
            const files: RepoFile[] = []

            parseStream.on("entry", (entry: any) => {
                const chunks: Buffer[] = []
                entry.on("data", (chunk: Buffer) => chunks.push(chunk))
                entry.on("end", () => {
                    const file = new RepoFile(this.stripTopLevelDir(entry.path), Buffer.concat(chunks))
                    return files.push(file)
                })
            })

            parseStream.on("end", () => resolve(files))
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

    private stripTopLevelDir(path: string): string {
        return path.replace(/.*?\//, "")
    }
}



