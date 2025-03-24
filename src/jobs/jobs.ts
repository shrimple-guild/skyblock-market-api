import cron from "node-cron"
import { auctionService, bazaarService, neuItemService, neuRepoManager } from "../services"
import type { WorkerMessage } from "../types/WorkerMessage"
import log4js from "log4js"
import { MillisecondDurations } from "../constants"

const logger = log4js.getLogger("jobs")

type Task = () => Promise<string> | string | void | Promise<void>

class Job {
	constructor(
		private name: string,
		private task: Task
	) {}

	schedule(expression: string) {
		cron.schedule(expression, () => this.execute())
	}

	async execute() {
		logger.log(`Starting job: ${this.name}`)
		try {
			const result = await this.task()
			logger.log(`Completed job: ${this.name}`)
			if (result) logger.log(result)
		} catch (e) {
			logger.error(`Job failed: ${this.name}`)
			logger.error(e)
		}
	}
}

const updateNeuRepo = new Job("update NEU repo", async () => {
	await neuRepoManager.load()


	// this updates the item resolver - check that items don't have duplicates
	const resolver = neuItemService.getItemResolver()
	const duplicates = resolver.checkForDuplicateDisplayNames()

	const warnings: string[] = []
	let internalNameDuplicateCount = 0
	for (const [name, internalNames] of duplicates) {
		if (internalNames.length < 2) continue
		internalNameDuplicateCount += internalNames.length
		warnings.push(`Duplicate internal names found for display name ${name}: ${internalNames.join(", ")}`)
	}
	if (warnings.length > 0) {
		logger.warn(`Found ${warnings.length} duplicate display names (${internalNameDuplicateCount} internal names).`)
		logger.trace(warnings.join("\n"))
	}
})

const auctionCleanup = new Job("clean up old auction", () =>
	auctionService.deleteOldAuctionData(MillisecondDurations.ONE_MONTH)
)

const bazaarCleanup = new Job("clean up bazaar", () =>
	bazaarService.deleteOldProductData(MillisecondDurations.ONE_WEEK)
)

const bazaarUpdate = new Job("update bazaar", async () => {
	await bazaarService.update()
})

const worker = new Worker("./src/workers/auction-worker.ts")

const auctionUpdate = new Job("update auctions", async () => {
	worker.postMessage("update-auctions")
	const promise: Promise<string> = new Promise((resolve, reject) => {
		const listener = (ev: MessageEvent<WorkerMessage>) => {
			const message = ev.data
			if (message.success == true) {
				resolve(`Saved ${message.bins} BINs.`)
			} else {
				reject(message.error)
			}
		}
		worker.onmessage = listener
	})
	return promise
})

function scheduleAll() {
	updateNeuRepo.schedule("0 0 12 * * *")
	auctionCleanup.schedule("15 0 0 * * *")
	bazaarCleanup.schedule("15 0 6 * * *")
	bazaarUpdate.schedule("0 * * * * *")
	auctionUpdate.schedule("30 * * * * *")
}

export const Jobs = { scheduleAll, updateNeuRepo: updateNeuRepo }
