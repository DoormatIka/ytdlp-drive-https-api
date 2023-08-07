import ytdl from "youtube-dl-exec";
import mime from "mime-types";
import path from "path";
import uuid from "short-uuid";
import { select } from "../helpers/format_operators.js";
import { RequestHandler } from "express";
import { HTTP } from "../type.js";

export const downloadf: HTTP<RequestHandler> = (drive) => {
    return {
        route: "/download",
        f: async (req, res) => {
            try {
                const { yt_info, mimetype } = await downloadVideo(req.body.link, req.body.best ?? 1);
                res.send({
                    filename: yt_info._filename,
                    name: path.basename(yt_info._filename),
                    mimetype: mimetype,
                });
            } catch (err) {
                res.send(err)
            }
        }
    }
}

async function downloadVideo(
    link: string,
    best: number,
) {
    const yt_info = await ytdl(link, {
        retries: 3,
        printJson: true,
        format: select("best", best),
        output: `media/%(uploader|No Uploader)s - %(title)s${uuid.generate()}.%(ext)s`,
        addHeader: [
            "referer:youtube.com",
            "user-agent:googlebot",
        ],
    });
    const mimetype = mime.lookup(yt_info._filename);
    return {
        yt_info,
        mimetype,
    }
}