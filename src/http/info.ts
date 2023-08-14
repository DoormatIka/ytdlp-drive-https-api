import ytdl from "youtube-dl-exec";
import path from "path";
import fetch from "node-fetch";
import { RequestHandler } from "express";
import { measureAverageDownloadSpeed } from "../helpers/average.js";
import { HTTP } from "../type.js";
import { select } from "../helpers/format_operators.js";

// const average_speed = await measureAverageDownloadSpeed();
const average_speed = {
    n: 100,
}

export const infof: HTTP<RequestHandler> = (drive) => {
    return {
        route: "/info",
        f: async (req, res) => {
            try {
                const video_info = await getInfo(req.body.link);
                const mbytes_size = compressedVideoSizeCalculator(
                    video_info.duration, 
                    video_info.tbr * 100, 
                    1,
                )
                res.send({
                    file: path.basename(video_info._filename),
                    uploader: video_info.uploader,
                    duration: video_info.duration,
                    size_mbytes: mbytes_size,
                    size_mbits: mbytes_size * 8,
                    speed_mbits: average_speed.n,
                    download_length_seconds: (mbytes_size * 8) / average_speed.n,
                })
            } catch (err) {
                console.log(err);
                res.send(err);
            }
        }
    }
}

async function getInfo(link: string) {
    return await ytdl(link, {
        printJson: true,
        skipDownload: true,
        output: "%(title)s",
        // format: select("best", best ?? 1),
        addHeader: ['referer:youtube.com', 'user-agent:googlebot'],
        noCheckCertificates: true,
        // verbose: true,
    })
}
/**
 * Returns size in megabytes. This is only used for estimations!
 * @param duration_in_seconds 
 * @param average_bits 
 * @param fps 
 * @returns 
 */
function compressedVideoSizeCalculator(
    duration_in_seconds: number,
    average_bits: number,
    adjust: number
) {
    return (average_bits * duration_in_seconds) / (8 * 1024 * 1024 * adjust)
}