import { auctionService, bazaarService } from "./services"
import type { BunRequest } from "bun"
import "./logger"
import log4js from "log4js"
import { Environment } from "./Environment"
import { Jobs } from "./jobs/jobs"

await Jobs.updateNeuRepo.execute()
Jobs.scheduleAll()

const logger = log4js.getLogger("api")

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

logger.log("Starting server.")

Bun.serve({
	port: Environment.MARKET_API_PORT,
	routes: {
		"/lowestbin/:query": (request) => {
			return handleRequest(request, () => {
				logger.log(`Called: ${new URL(request.url).pathname}`)
				const query = request.params.query
				const item = auctionService.searchForItem(query)
				if (!item) {
					return new Response(`No item found matching "${query}."`, { status: 404 })
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

		"/bazaar": (request) => {
			return handleRequest(request, () => {
				const productData = bazaarService.getAllProducts().map((product) => {
					return bazaarService.getProductData(product)
				})
				const allProducts: Record<string, any> = {}
				for (const product of productData) {
					allProducts[product.internalName] = product
				}
				return Response.json(allProducts)
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
