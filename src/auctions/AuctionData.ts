import { Database } from "bun:sqlite"
import type { Bin } from "./Auctions"

export class AuctionData {
	private db: Database

	constructor(path: string = ":memory:") {
		this.db = new Database(path, { create: true, strict: true })

		this.db.exec(`
            CREATE TABLE IF NOT EXISTS auction_items (
				id INTEGER PRIMARY KEY,
				internal_name TEXT UNIQUE NOT NULL,
				last_seen INTEGER NOT NULL
			);

			CREATE TABLE IF NOT EXISTS auction_ts (
				item_id INTEGER NOT NULL,
				timestamp INTEGER NOT NULL,
				lowest_bin INTEGER NOT NULL,
				PRIMARY KEY(item_id, timestamp),
				FOREIGN KEY(item_id) REFERENCES auction_items(id)
			);
        `)
	}

	deleteOldAuctions(before: number): void {
		this.db.query("DELETE FROM auction_ts WHERE timestamp < ?").run(Math.floor(before / 1000))
	}

	insertBins(time: number, bins: Bin[]): void {
		this.db.transaction(() => {
			for (const bin of bins) {
				this.insertBin(time, bin.internalName, bin.lowestBin)
			}
		})()
	}

	insertBin(time: number, internalName: string, lowestBin: number): void {
		this.db.transaction(() => {
			this.db
				.query(`
					INSERT INTO auction_items (internal_name, last_seen) VALUES (?, ?)
					ON CONFLICT (internal_name) DO UPDATE SET last_seen = excluded.last_seen`)
				.run(internalName, time)

			this.db
				.query(`
					INSERT OR IGNORE INTO auction_ts (item_id, timestamp, lowest_bin) 
					SELECT auction_items.id, ?1, ?3
					FROM auction_items
					WHERE internal_name = ?2`
				)
				.run(Math.floor(time / 1000), internalName, lowestBin)
		})()
	}

	getInternalNames(): string[] {
		return this.db
			.prepare<{ internal_name: string }, []>("SELECT internal_name FROM auction_items")
			.all()
			.map((row) => row.internal_name)
	}

	getLatestAuction(internalName: string): CurrentLowestBinResult | null {
		const stmt = `
            SELECT 
				timestamp, 
				lowest_bin AS lowestBin, 
				(SELECT MAX(timestamp) FROM auction_ts) AS latestTimestamp
			FROM auction_ts
			WHERE item_id = (SELECT id FROM auction_items WHERE internal_name = ?)
			ORDER BY timestamp DESC
			LIMIT 1;
        `
		const result = this.db
			.query<CurrentLowestBinResult, string>(stmt)
			.get(internalName)

		if (result == null) return null
		result.latestTimestamp *= 1000
		result.timestamp *= 1000
		return result
	}

	getAveragePrice(internalName: string, time: number, window: number): number | null {
		const stmt = `
            SELECT AVG(lowest_bin) AS averageLowestBin
            FROM auction_ts
            WHERE item_id = (SELECT id FROM auction_items WHERE internal_name = $internalName)
            AND $current - timestamp <= $window
        `
		return (
			this.db.query<{ averageLowestBin: number }, AveragePriceQuery>(stmt).get({
				current: Math.floor(time / 1000),
				internalName: internalName,
				window: Math.floor(window / 1000)
			})?.averageLowestBin ?? null
		)
	}
}

type CurrentLowestBinResult = {
	timestamp: number
	lowestBin: number
	latestTimestamp: number
}

type AveragePriceQuery = {
	current: number
	internalName: string
	window: number
}
