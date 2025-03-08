import { AuctionData } from "../auctions/AuctionData"
import { Auctions } from "../auctions/Auctions"
import type { WorkerMessage } from "../types/WorkerMessage"

declare var self: Worker

const auctionData = new AuctionData("./src/data/auction.db")

self.addEventListener("message", async (ev) => {
	if (ev.data != "update-auctions") return
	try {
		const start = performance.now()
		const binResult = await Auctions.fetchBins()
		auctionData.insertBins(binResult.timestamp, binResult.bins)
		const end = performance.now()
		postStatus({ success: true, bins: binResult.bins.length, time: end - start })
	} catch (e) {
		postStatus({ success: false, error: e })
	}
})

function postStatus(status: WorkerMessage) {
	postMessage(status)
}
