import { RequestHandler } from "express";
import { measureAverageDownloadSpeed } from "../helpers/average.js";
import { HTTP } from "../type.js";

export const measuref: HTTP<RequestHandler> = (drive) => {
    return {
        route: "/measure",
        f: async (req, res) => {
            res.send(await measureAverageDownloadSpeed())
        }
    }
}