import { AuctionService } from "./auctions/AuctionService"
import { BazaarService } from "./bazaar/BazaarService"
import { NeuItemService } from "./items/NeuItems"

export const neuItemService = new NeuItemService("NotEnoughUpdates", "NotEnoughUpdates-REPO", "master", "./src/data")
await neuItemService.load()
const resolver = neuItemService.getItemResolver()
export const bazaarService = await BazaarService.init(resolver, "./src/data/auction.db")
export const auctionService = new AuctionService(resolver, "./src/data/auction.db")
