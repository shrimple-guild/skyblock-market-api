import { AuctionService } from "./auctions/AuctionService"
import { BazaarService } from "./bazaar/BazaarService"
import { NeuItemService } from "./items/NeuItemService"
import { NeuRepoManager } from "./neu/NeuRepoManager"

export const neuRepoManager = new NeuRepoManager("NotEnoughUpdates", "NotEnoughUpdates-REPO", "master", "./src/data")
export const neuItemService = new NeuItemService(neuRepoManager)

export const bazaarService = await BazaarService.init("./src/data/auction.db")
export const auctionService = new AuctionService("./src/data/auction.db")
