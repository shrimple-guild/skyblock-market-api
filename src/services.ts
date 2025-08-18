import { AuctionService } from "./auctions/AuctionService"
import { BazaarService } from "./bazaar/BazaarService"
import { Environment } from "./Environment"
import { HypixelClient } from "./hypixel/HypixelClient"
import { ItemService } from "./items/ItemService"
import { MojangClient } from "./mojang/MojangClient"
import { NeuRepoManager } from "./neu/NeuRepoManager"

export const neuRepoManager = new NeuRepoManager("NotEnoughUpdates", "NotEnoughUpdates-REPO", "master", "./src/data")

export const hypixelClient = new HypixelClient("https://api.hypixel.net/", Environment.HYPIXEL_API_KEY);
export const neuItemService = new ItemService(hypixelClient, neuRepoManager)
export const bazaarService = await BazaarService.init(hypixelClient, neuItemService, "./src/data/auction.db")
export const auctionService = new AuctionService(neuItemService, "./src/data/auction.db")

export const mojangClient = new MojangClient()
