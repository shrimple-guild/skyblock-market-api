import type { NeuRepo } from "./NeuRepo"

export type NeuRepositoryListener = (repo: NeuRepo) => void

export interface ApiCommitResponse {
	sha: string
}
