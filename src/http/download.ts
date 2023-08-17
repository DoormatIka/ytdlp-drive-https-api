import ytdl from "youtube-dl-exec";
import mime from "mime-types";
import path from "path";
import uuid from "short-uuid";
import { select } from "../helpers/format_operators.js";
import { RequestHandler } from "express";
import { HTTP } from "../type.js";

export const downloadf: HTTP<RequestHandler> = (drive) => {
    /*
    Fields needed:
        {
            link:      string,
            format_id: string,
        }
    */
    return {
        route: "/download",
        f: async (req, res) => {
            try {
                const { yt_info, mimetype } = await downloadVideo(
                    req.body.link,
                    req.body.format_id,
                );
                res.send({
                    filename: yt_info._filename,
                    name: path.basename(yt_info._filename),
                    mimetype: mimetype,
                });
            } catch (err) {
                console.log(err);
                res.send(err)
            }
        }
    }
}

async function downloadVideo(
    link: string,
    format_id?: string
) {
    const yt_info = await ytdl(link, {
        retries: 3,
        printJson: true,
        format: format_id,
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