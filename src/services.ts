import { AuctionService } from "./auctions/AuctionService"
import { BazaarService } from "./bazaar/BazaarService"
import { NeuItemService } from "./items/NeuItems"
import { Jobs } from "./jobs/jobs"

export const neuItemService = new NeuItemService("NotEnoughUpdates", "NotEnoughUpdates-REPO", "master", "./src/data")
export const bazaarService = await BazaarService.init("./src/data/auction.db")
export const auctionService = new AuctionService("./src/data/auction.db")
await Jobs.updateItemNames()
