export type ApiSkyblockBazaarResponse = {
	success: boolean
	lastUpdated: number
	products: Record<string, ApiSkyblockBazaarProduct>
}

export type ApiSkyblockBazaarOrder = {
	amount: number
	pricePerUnit: number
	orders: number
}

type ApiSkyblockBazaarQuickStatus = {
	productId: string
	sellPrice: number
	sellVolume: number
	sellMovingWeek: number
	sellOrders: number
	buyPrice: number
	buyVolume: number
	buyMovingWeek: number
	buyOrders: number
}

export type ApiSkyblockBazaarProduct = {
	product_id: string
	sell_summary: ApiSkyblockBazaarOrder[]
	buy_summary: ApiSkyblockBazaarOrder[]
	quick_status: ApiSkyblockBazaarQuickStatus
}
