import { AuctionService } from "./auctions/AuctionService"
import { BazaarService } from "./bazaar/BazaarService"
import { ItemService } from "./items/ItemService"
import { NeuRepoManager } from "./neu/NeuRepoManager"

export const neuRepoManager = new NeuRepoManager("NotEnoughUpdates", "NotEnoughUpdates-REPO", "master", "./src/data")

export const neuItemService = new ItemService(neuRepoManager)
export const bazaarService = await BazaarService.init(neuItemService, "./src/data/auction.db")
export const auctionService = new AuctionService(neuItemService, "./src/data/auction.db")
