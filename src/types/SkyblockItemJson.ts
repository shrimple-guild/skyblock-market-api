export type ApiSkyblockItemsResponse = {
    success: true,
    lastUpdated: number,
    items: SkyblockItemJson[]
}

export interface SkyblockItemJson {
    id: string,
    name: string
}