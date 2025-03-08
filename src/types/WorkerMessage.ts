type SuccessMessage = {
	success: true
	bins: number
	time: number
}

type ErrorMessage = {
	success: false
	error: unknown
}

export type WorkerMessage = SuccessMessage | ErrorMessage
