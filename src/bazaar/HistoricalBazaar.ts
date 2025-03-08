import { Database } from "bun:sqlite"
import type { Bazaar } from "./Bazaar"

export class HistoricalBazaar {
    private db: Database

    constructor(path: string = ":memory:") {
        this.db = new Database(path, { create: true, strict: true })

        this.db.exec(`
            CREATE TABLE IF NOT EXISTS bazaar (
                timestamp INTEGER NOT NULL,
                internalName TEXT NOT NULL,
                instaBuy REAL,
                instaSell REAL,
                UNIQUE(timestamp, internalName)
            )
        `)
    }

    deleteOldProducts(before: number): void {
        this.db.query("DELETE FROM bazaar WHERE timestamp < ?").run(Math.floor(before / 1000))
    }

    insertProducts(bazaar: Bazaar): void {
        this.db.transaction(() => {
            for (const product of bazaar.getProducts()) {
                this.insertProduct(bazaar.getLastUpdated(), product.getInternalName(), product.getInstabuyPrice(), product.getInstasellPrice())
            }
        })()
    }

    insertProduct(time: number, internalName: string, instaBuy: number | null, instaSell: number | null): void {
        this.db
            .query("INSERT OR IGNORE INTO bazaar (timestamp, internalName, instaBuy, instaSell) VALUES (?, ?, ?, ?)")
            .run(Math.floor(time / 1000), internalName, instaBuy, instaSell)
    }

    getAveragePrice(internalName: string, time: number, window: number): AverageResult | null {
        const stmt = `
            SELECT AVG(instaBuy) AS avgInstaBuy, AVG(instaSell) AS avgInstaSell
            FROM bazaar
            WHERE internalName = $internalName
            AND $current - timestamp <= $window
        `
        return (
            this.db.query<AverageResult, AveragePriceQuery>(stmt).get({
                current: Math.floor(time / 1000),
                internalName: internalName,
                window: Math.floor(window / 1000)
            }) ?? null
        )
    }
}

type BazaarProduct = {
    internalName: string,
    instaBuy: number,
    instaSell: number
}

type AverageResult = {
    avgInstaBuy: number
    avgInstaSell: number
}

type AveragePriceQuery = {
	current: number
	internalName: string
	window: number
}
