
import log4js from "log4js"

log4js.configure({
    appenders: {
        out: { type: "stdout" },
        app: { type: "file", filename: "application.log" },
    },
    categories: {
        default: { appenders: ["out"], level: "info" },
        jobs: { appenders: ["out"], level: "info" },
        api: { appenders: ["out"], level: "info" },
      }
})


export const logCategories = log4js