export type ApiLowestBinResponse = {
    name: string,
    internalName: string,
    seenAt: string,
    current: boolean,
    lowestBin: number 
}

export type ApiBazaarBulkResponse = {
    name: string
    internalName: string
    instaBuy: ApiBazaarBulkQuantity
    instaSell: ApiBazaarBulkQuantity
}

export type ApiBazaarProductResponse = {
    name: string
    internalName: string
    sellMarketValue: ApiBazaarBulkQuantity
    buyMarketValue: ApiBazaarBulkQuantity
    current: ApiBazaarBuySell
    oneDayAverage: ApiBazaarBuySell
    oneWeekAverage: ApiBazaarBuySell
}

type ApiBazaarBulkQuantity = {
    quantity: number,
    value: number
}

type ApiBazaarBuySell = {
    instaBuy: number | null
    instaSell: number | null
}