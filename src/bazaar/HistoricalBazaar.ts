import { Database } from "bun:sqlite"
import type { Bazaar } from "./Bazaar"

export class HistoricalBazaar {
	private db: Database

	constructor(path: string = ":memory:") {
		this.db = new Database(path, { create: true, strict: true })

		this.db.exec(`
			CREATE TABLE IF NOT EXISTS bazaar_items (
				id INTEGER PRIMARY KEY,
				internal_name TEXT UNIQUE NOT NULL
			);

            CREATE TABLE IF NOT EXISTS bazaar_ts (
			    item_id INTEGER NOT NULL,
                timestamp INTEGER NOT NULL,
                insta_buy REAL,
                insta_sell REAL,
                PRIMARY KEY(item_id, timestamp),
				FOREIGN KEY(item_id) REFERENCES bazaar_items(id)
            );
        `)
	}

	deleteOldProducts(before: number): void {
		this.db.query("DELETE FROM bazaar_ts WHERE timestamp < ?").run(Math.floor(before / 1000))
	}

	insertProducts(bazaar: Bazaar): void {
		this.db.transaction(() => {
			for (const product of bazaar.getProducts()) {
				this.insertProduct(
					bazaar.getLastUpdated(),
					product.getInternalName(),
					product.getInstabuyPrice(),
					product.getInstasellPrice()
				)
			}
		})()
	}

	insertProduct(time: number, internalName: string, instaBuy: number | null, instaSell: number | null): void {
		this.db.transaction(() => {
			this.db.query("INSERT OR IGNORE INTO bazaar_items (internal_name) VALUES (?)").run(internalName)

			this.db
				.query(
					`
					INSERT OR IGNORE INTO bazaar_ts (item_id, timestamp, insta_buy, insta_sell) 
					SELECT bazaar_items.id, ?1, ?3, ?4
					FROM bazaar_items
					WHERE internal_name = ?2`
				)
				.run(Math.floor(time / 1000), internalName, instaBuy, instaSell)
		})()
	}

	getAveragePrice(internalName: string, time: number, window: number) {
		const stmt = `
            SELECT AVG(insta_buy) AS avgInstaBuy, AVG(insta_sell) AS avgInstaSell
            FROM bazaar_ts
			WHERE item_id = (SELECT id FROM bazaar_items WHERE internal_name = $internalName)
            AND $current - timestamp <= $window
        `
		const result = this.db.query<AverageResult, AveragePriceQuery>(stmt).get({
			current: Math.floor(time / 1000),
			internalName: internalName,
			window: Math.floor(window / 1000)
		})
		return {
			instaBuy: result?.avgInstaBuy ?? null,
			instaSell: result?.avgInstaSell ?? null
		}
	}
}

type BazaarProduct = {
	internalName: string
	instaBuy: number
	instaSell: number
}

type AverageResult = {
	avgInstaBuy: number | null
	avgInstaSell: number | null
}

type AveragePriceQuery = {
	current: number
	internalName: string
	window: number
}
