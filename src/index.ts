import fuzzysort from "fuzzysort"
import { AuctionData } from "./auctions/AuctionData"
import { ItemNameResolver } from "./items/ItemNameResolver"
import { NeuItems } from "./items/NeuItems"
import type { WorkerMessage } from "./types/WorkerMessage"
import cron from "node-cron"
import { BazaarService } from "./bazaar/BazaarService"

const port = Bun.env["MARKET_API_PORT"]

if (!port) {
	throw new Error(`Required environment variable \"MARKET_API_PORT\" not set.`)
}

const auctions = new AuctionData("./src/data/auction.db")
const neuItems = new NeuItems("NotEnoughUpdates", "NotEnoughUpdates-REPO", "master", "./src/data")
await neuItems.load()
const itemNameResolver = new ItemNameResolver(neuItems.getItemJson())

const bazaarService = await BazaarService.init(itemNameResolver, "./src/data/auction.db")

const worker = new Worker("./src/auctions/update-worker.ts")

cron.schedule("30 * * * * *", (time) => {
	if (time instanceof Date) {
		console.log(`[${time.toISOString()}] Starting auction update.`)
	}
	worker.postMessage("update-auctions")
})

cron.schedule("*/20 * * * * *", async (time) => {
	if (time instanceof Date) {
		console.log(`[${time.toISOString()}] Starting bazaar update.`)
	}
	await bazaarService.update()
})

cron.schedule("0 0 0 * * *", (time) => {
	if (time instanceof Date) {
		console.log(`[${time.toISOString()}] Starting auction cleanup.`)
	}
	const deleteBefore = Date.now() - 30 * 24 * 60 * 60 * 1000
	bazaarService.deleteOldProductData(deleteBefore)
	auctions.deleteOldAuctions(deleteBefore)
})

worker.addEventListener("message", (ev) => {
	const message = ev.data as WorkerMessage
	if (message.success == true) {
		console.log(`Updated ${message.bins} BINs in ${message.time.toFixed(1)} ms.`)
	} else {
		console.error(message.error)
	}
})

Bun.serve({
	port,
	routes: {
		"/lowestbin/:query": (request) => {
			const query = request.params.query
			const names = auctions.getInternalNames()
			const targets = names.map((name) => itemNameResolver.resolve(name))
			const fuzzy = fuzzysort.go(query, targets, { key: "displayName", limit: 1 }).at(0)
			if (!fuzzy) {
				return new Response(`No item found matching "${query}"`, { status: 404 })
			}
			const internalName = fuzzy.obj.internalName
			const data = auctions.getLatestAuction(internalName)
			if (!data) {
				// (this should not actually be possible)
				return new Response(`No recent auctions found for item.`, { status: 404 })
			}

			return Response.json({
				name: fuzzy.obj.displayName,
				internalName,
				seenAt: new Date(data.timestamp),
				current: data.timestamp == data.latestTimestamp,
				lowestBin: data.lowestBin
			})
		},

		"/bazaar/:query": (request) => {
			const query = request.params.query
			const item = bazaarService.searchForProduct(request.params.query)
			if (!item) {
				return new Response(`No item found matching "${query}."`, { status: 404 })
			}
			return Response.json(bazaarService.getProductData(item))
		},

		"/bazaar/:query/bulk/:quantity": (request) => {
			const query = request.params.query
			const quantity = parseInt(request.params.quantity)
			const item = bazaarService.searchForProduct(request.params.query)
			if (!item) {
				return new Response(`No item found matching "${query}."`, { status: 404 })
			}	

			if (Number.isNaN(quantity)) {
				return new Response('"quantity" must be a number.', { status: 400 })
			}
			
			return Response.json(bazaarService.getBulkValue(item, quantity))
		}
	}
})
