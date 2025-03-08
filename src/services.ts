import { AuctionService } from "./auctions/AuctionService"
import { BazaarService } from "./bazaar/BazaarService"
import { NeuItemService } from "./items/NeuItems"

export const neuItemService = new NeuItemService("NotEnoughUpdates", "NotEnoughUpdates-REPO", "master", "./src/data")
export const bazaarService = await BazaarService.init(neuItemService.getItems(), "./src/data/auction.db")
export const auctionService = new AuctionService(neuItemService.getItems(), "./src/data/auction.db")