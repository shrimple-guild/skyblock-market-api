import { auctionService, bazaarService } from "./services"
import "./jobs/jobs"
import { logCategories } from "./logger"
import type { BunRequest } from "bun"

const logger = logCategories.getLogger("api")


const port = Bun.env["MARKET_API_PORT"]
if (!port) throw new Error(`Required environment variable \"MARKET_API_PORT\" not set.`)


function handleRequest(request: BunRequest, handler: () => Promise<Response> | Response) {
	const url = new URL(request.url)
	logger.log(`Request received: ${url.pathname}`)
	try {
		const response = handler()
		logger.log(`Responded to request.`)
		return response
	} catch (e) {
		logger.error("Unhandled error.")
		logger.error(e)
		return new Response("Internal server error.", { status: 500 })
	}
}

Bun.serve({
	port,
	routes: {
		"/lowestbin/:query": (request) => {
			return handleRequest(request, () => {
				logger.log(`Called: ${new URL(request.url).pathname}`)
				const item = auctionService.searchForItem(request.params.query)
				if (!item) {
					return new Response(`No item found matching "${item}."`, { status: 404 })
				}
				return Response.json(auctionService.getItemData(item))
			})
			
		},

		"/bazaar/:query": (request) => {
			return handleRequest(request, () => {
				const query = request.params.query
				const item = bazaarService.searchForProduct(request.params.query)
				if (!item) {
					return new Response(`No item found matching "${query}."`, { status: 404 })
				}
				return Response.json(bazaarService.getProductData(item))
			})
		},

		"/bazaar/:query/bulk/:quantity": (request) => {
			return handleRequest(request, () => {
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
			})	
		}
	}
})
