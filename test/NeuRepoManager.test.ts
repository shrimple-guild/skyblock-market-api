import { it, expect } from "bun:test"
import { NeuRepoManager } from "../src/neu/NeuRepoManager"

const repo = new NeuRepoManager("NotEnoughUpdates", "NotEnoughUpdates-REPO", "master", "./src/data")

await repo.load()
