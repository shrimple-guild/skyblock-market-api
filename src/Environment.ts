function getEnv(name: string): string {
	const value = Bun.env[name]
	if (value == null) {
		throw new Error(`Missing environment variable: ${name}`)
	}
	return value
}

export const Environment = {
	MARKET_API_PORT: getEnv("MARKET_API_PORT")
}
