import type { ApiSkyblockBazaarJson } from "../types/ApiSkyblockBazaarJson";
import { Bazaar } from "./Bazaar";
import type { BazaarProduct } from "./BazaarProduct";
import { HistoricalBazaar } from "./HistoricalBazaar";

export class BazaarService {
    private static URL = "https://api.hypixel.net/skyblock/bazaar"
    private bazaar: Bazaar
    private historical: HistoricalBazaar

    static async init(path?: string) {
        const bazaar = await BazaarService.fetchBazaar()
        return new BazaarService(bazaar, path)
    }

    private constructor(bazaar: Bazaar, path?: string) {
        this.bazaar = bazaar
        this.historical = new HistoricalBazaar(path)
    }

    private static async fetchBazaar(): Promise<Bazaar> {
        const response = await fetch(BazaarService.URL)
        const data = (await response.json()) as ApiSkyblockBazaarJson
        return new Bazaar(data)
    }

    async update() {
        this.bazaar = await BazaarService.fetchBazaar()
        this.historical.insertProducts(this.bazaar)
    }

    async deleteOldProductData(before: number) {
        this.historical.deleteOldProducts(before)
    }

    getProductInternalNames(): string[] {
        return this.bazaar.getProductInternalNames()
    }

    getProduct(internalName: string): BazaarProduct | null {
        return this.bazaar.getProducts().find(product => product.getInternalName() == internalName) ?? null
    }

    getProductPriceLastDay(internalName: string) {
        return this.historical.getAveragePrice(internalName, Date.now(), 24 * 60 * 60 * 100)
    }

}