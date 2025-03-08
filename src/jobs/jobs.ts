import cron from "node-cron"
import { auctionService, bazaarService, neuItemService } from "../services"
import type { WorkerMessage } from "../types/WorkerMessage"
import { logCategories } from "../logger"

const logger = logCategories.getLogger("jobs")

function schedule(name: string, expression: string, task: () => Promise<void> | void) {
    cron.schedule(expression, async (time) => {
        logger.log(`Starting job: ${name}.`)
        try {
            await task()
            logger.log(`Completed job: ${name}.`)
        } catch (e) {
            logger.error(`Job failed: ${name}`)
            logger.error(e)
        }
    })
}


schedule("update item names", "0 0 12 * * *", async () => {
    await neuItemService.load()
    bazaarService.updateItemNames(neuItemService.getItems())
    auctionService.updateItemNames(neuItemService.getItems())
})

schedule("update bazaar products", "*/20 * * * * *", async () => {
    await bazaarService.update()
})

schedule("clean up auctions", "0 0 0 * * *", () => {
    auctionService.deleteOldAuctionData()
})

schedule("clean up bazaar products", "0 0 6 * * *", () => {
    bazaarService.deleteOldProductData()
})


const worker = new Worker("./src/jobs/auction-worker.ts")

schedule("update auctions", "30 * * * * *", async () => {
    worker.postMessage("update-auctions")
    const promise: Promise<void> = new Promise((resolve, reject) => {
        const listener = (ev: MessageEvent<WorkerMessage>) => {
            worker.removeEventListener("message", listener)
            const message = ev.data 
            if (message.success == true) {
                resolve()
            } else {
                reject(message.error)
            }
        }
        worker.addEventListener("message", listener)
    })
    return promise
})

