import log4js from "log4js"

log4js.configure({
	appenders: {
		out: { type: "stdout" }
	},
	categories: {
		default: { appenders: ["out"], level: "off" },
		jobs: { appenders: ["out"], level: "info" },
		api: { appenders: ["out"], level: "info" },
		hypixel: { appenders: ["out"], level: "info" }
	}
})
