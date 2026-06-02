import { auctionService, bazaarService, hypixelClient, mojangClient, neuRepoManager } from "./services"
import type { BunRequest } from "bun"
import "./logger"
import log4js from "log4js"
import { Environment } from "./Environment"
import { Jobs } from "./jobs/jobs"
import { UuidUtils } from "./utils/UuidUtils"
import { NeuBestiary } from "./neu/NeuBestiary"
import { LevelResolver } from "./utils/LevelResolver"
import { NeuSkillLevels } from "./neu/NeuSkillLevels"
import type { NeuLevelingJson } from "./types/NeuLevelingJson"

let neuBestiary: NeuBestiary
let neuSkillLevels: NeuSkillLevels

neuRepoManager.addListener((repo) => {
	neuBestiary = new NeuBestiary(repo.getConstant("bestiary"))
	const levelingJson = repo.getConstant<NeuLevelingJson>("leveling")
	if (levelingJson != null) {
		neuSkillLevels = new NeuSkillLevels(levelingJson)
	} else {
		throw new Error("No NEU leveling JSON found.")
	}
})

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

logger.log(`Starting server at port ${Environment.MARKET_API_PORT}.`)

Bun.serve({
	port: Environment.MARKET_API_PORT,
	routes: {
		"/hypixel/raw/players/:uuid": (request) => {
			return handleRequest(request, async () => {
				const uuid = request.params.uuid

				if (!UuidUtils.isValidUuid(uuid)) {
					return new Response(`Invalid UUID format: "${uuid}".`, { status: 400 })
				}

				const player = await hypixelClient.getPlayer(uuid)

				if (!player) {
					return new Response(`No player found for UUID "${uuid}".`, { status: 404 })
				}

				return Response.json(player.raw)
			})
		},

		"/hypixel/raw/guilds/:mode/:query": (request) => {
			return handleRequest(request, async () => {
				const { mode, query } = request.params

				const validModes = ["name", "player", "id"]

				if (!validModes.includes(mode)) {
					return new Response(`Invalid mode: "${mode}". Valid modes are ${validModes.join(", ")}.`, {
						status: 400
					})
				}

				const guild = await hypixelClient.getGuild(mode, query)

				if (!guild) {
					return new Response(`No guild found for "${query}" (mode: ${mode}).`, { status: 404 })
				}

				return Response.json(guild.raw)
			})
		},

		"/hypixel/skyblock/players/:uuid/profiles/:profile": (request) => {
			return handleRequest(request, async () => {
				const uuid = request.params.uuid
				const profileQuery = request.params.profile

				if (!UuidUtils.isValidUuid(uuid)) {
					return new Response(`Invalid UUID format: "${uuid}".`, { status: 400 })
				}

				const profiles = await hypixelClient.getSkyblockProfiles(uuid)
				const profile = profiles.getByQuery(profileQuery)
				return Response.json(profile?.getQueriedMember())
			})
		},

		"/hypixel/skyblock/players/:uuid/profiles/:profile/bestiary": (request) => {
			return handleRequest(request, async () => {
				const uuid = request.params.uuid
				const profileQuery = request.params.profile

				const profiles = await hypixelClient.getSkyblockProfiles(uuid)
				const profile = profiles.getByQuery(profileQuery)

				if (!profile) {
					return new Response(`Invalid profile`, { status: 400 })
				}
				const member = profile.getQueriedMember()
				const families = neuBestiary.getBestiaryFamilies().map((family) => {
					return neuBestiary.getBestiary(family, member)
				})

				return Response.json(families)
			})
		},

		"/hypixel/skyblock/players/:uuid/profiles/:profile/skills": (request) => {
			return handleRequest(request, async () => {
				const uuid = request.params.uuid
				const profileQuery = request.params.profile

				const profiles = await hypixelClient.getSkyblockProfiles(uuid)
				const profile = profiles.getByQuery(profileQuery)

				if (!profile) {
					return new Response(`Invalid profile`, { status: 400 })
				}

				const member = profile.getQueriedMember()

				const skills = neuSkillLevels.getSkills().map((skill) => {
					return neuSkillLevels.getSkillInfo(skill, member)
				})

				return Response.json(skills)
			})
		},

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
		},

		"/mojang/:query": (request) => {
			return handleRequest(request, async () => {
				const query = request.params.query

				const isUuid = UuidUtils.isValidUuid(query)
				const isName = mojangClient.isValidUsername(query)

				if (!isUuid && !isName) {
					return new Response(`Invalid username or UUID.`, { status: 400 })
				}

				const player = await (isUuid ? mojangClient.getByUuid(query) : mojangClient.getByName(query))

				if (!player) {
					const queryType = isUuid ? "UUID" : "username"
					return new Response(`No player found with ${queryType} \"${query}\".`, { status: 404 })
				}

				return Response.json(player)
			})
		}
	}
})
