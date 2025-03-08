import { Database } from "bun:sqlite"
import type { Bin } from "./Auctions"

export class AuctionData {
	private db: Database

	constructor(path: string = ":memory:") {
		this.db = new Database(path, { create: true, strict: true })

		this.db.exec(`
            CREATE TABLE IF NOT EXISTS auctions (
                timestamp INTEGER NOT NULL,
                internalName TEXT NOT NULL,
                lowestBin INTEGER NOT NULL,
                UNIQUE(timestamp, internalName)
            )
        `)
	}

	deleteOldAuctions(before: number): void {
		this.db.query("DELETE FROM auctions WHERE timestamp < ?").run(Math.floor(before / 1000))
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
			.query("INSERT OR IGNORE INTO auctions (timestamp, internalName, lowestBin) VALUES (?, ?, ?)")
			.run(Math.floor(time / 1000), internalName, lowestBin)
	}

	getInternalNames(): string[] {
		return this.db
			.prepare<{ internalName: string }, []>("SELECT DISTINCT internalName FROM auctions")
			.all()
			.map((row) => row.internalName)
	}

	getLatestAuction(internalName: string): CurrentLowestBinResult | null {
		const stmt = `
            SELECT timestamp, lowestBin, (SELECT MAX(timestamp) FROM auctions) AS latestTimestamp
            FROM auctions 
            WHERE internalName = $internalName
            AND timestamp = (SELECT MAX(timestamp) FROM auctions WHERE internalName = $internalName)
        `
		const result = this.db
			.query<CurrentLowestBinResult, { internalName: string }>(stmt)
			.get({ internalName: internalName })

		if (result == null) return null
		result.latestTimestamp *= 1000
		result.timestamp *= 1000
		return result
	}

	getAveragePrice(internalName: string, time: number, window: number): number | null {
		const stmt = `
            SELECT AVG(lowestBin) AS averageLowestBin
            FROM auctions
            WHERE internalName = $internalName
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
