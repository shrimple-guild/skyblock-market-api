export class HypixelApiError extends Error {
	public readonly statusCode: number
	public readonly url: string

	constructor(url: string, response: Response) {
		const message = `Error ${response.status}: ${response.statusText}`
		super(message)
		this.name = "HypixelApiError"
		this.statusCode = response.status
		this.url = response.url
	}
}
