import cron from "node-cron"
import { auctionService, bazaarService, neuItemService } from "../services"
import type { WorkerMessage } from "../types/WorkerMessage"
import { logCategories } from "../logger"
import { MillisecondDurations } from "../constants"

const logger = logCategories.getLogger("jobs")

function schedule(name: string, expression: string, task: () => Promise<string> | string | void | Promise<void>) {
	cron.schedule(expression, async () => {
		logger.log(`Starting job: ${name}.`)
		try {
			const result = await task()
			logger.log(`Completed job: ${name}`)
			if (result) logger.log(result)
		} catch (e) {
			logger.error(`Job failed: ${name}`)
			logger.error(e)
		}
	})
}

schedule("update item names", "0 0 12 * * *", async () => {
	await neuItemService.load()
	const resolver = neuItemService.getItemResolver()
	bazaarService.updateItemNames(resolver)
	auctionService.updateItemNames(resolver)
})

schedule("clean up auctions", "0 0 0 * * *", () => {
	auctionService.deleteOldAuctionData(MillisecondDurations.ONE_MONTH)
})

schedule("clean up bazaar products", "0 0 6 * * *", () => {
	bazaarService.deleteOldProductData(MillisecondDurations.ONE_MONTH)
})

schedule("update bazaar products", "0 * * * * *", async () => {
	await bazaarService.update()
})

const worker = new Worker("./src/jobs/auction-worker.ts")

schedule("update auctions", "30 * * * * *", async () => {
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
