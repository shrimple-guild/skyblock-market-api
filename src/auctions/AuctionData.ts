import { Database } from "bun:sqlite"
import type { Bin } from "./Auctions"

export class AuctionData {
	private db: Database

	constructor(path: string = ":memory:") {
		this.db = new Database(path, { create: true, strict: true })

		this.db.exec(`
			CREATE TABLE IF NOT EXISTS auctions (
				internal_name TEXT PRIMARY KEY,
				last_seen INTEGER NOT NULL,
				lowest_bin INTEGER NOT NULL
			);
        `)
	}

	deleteOldAuctions(before: number): void {
		this.db.query("DELETE FROM auctions WHERE last_seen < ?").run(Math.floor(before / 1000))
	}

	insertBins(time: number, bins: Bin[]): void {
		this.db.transaction(() => {
			for (const bin of bins) {
				this.insertBin(time, bin.internalName, bin.lowestBin)
			}
		})()
	}

	insertBin(time: number, internalName: string, lowestBin: number): void {
		this.db
			.query(
				`
				INSERT OR REPLACE INTO auctions (internal_name, last_seen, lowest_bin) 
				VALUES (?, ?, ?)
			`
			)
			.run(internalName, Math.floor(time / 1000), lowestBin)
	}

	getInternalNames(): string[] {
		return this.db
			.prepare<{ internal_name: string }, []>("SELECT internal_name FROM auctions")
			.all()
			.map((row) => row.internal_name)
	}

	getLowestBin(internalName: string): CurrentLowestBinResult | null {
		const result = this.db
			.query<CurrentLowestBinResult, string>(
				`
            SELECT 
			last_seen AS timestamp, 
			lowest_bin AS lowestBin, 
			(SELECT MAX(last_seen) FROM auctions) AS latestTimestamp
			FROM auctions
			WHERE internal_name = ?
        `
			)
			.get(internalName)

		if (result == null) return null
		result.latestTimestamp *= 1000
		result.timestamp *= 1000
		return result
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
