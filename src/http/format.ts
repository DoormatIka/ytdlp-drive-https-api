import ytdl from "youtube-dl-exec";
import { RequestHandler } from "express";
import { HTTP } from "../type.js";

export const formatf: HTTP<RequestHandler> = (drive) => {
    return {
        route: "/format",
        f: async (req, res) => {
            try {
                const video_info = await getInfo(req.body.link);
                res.send({
                    formats: video_info.formats.map(v => {
                        return {
                            format: v.format,
                            format_id: v.format_id,
                            format_note: v.format_note,
                            video_codec: v.vcodec,
                            audio_codec: v.acodec,
                            container: v.container,
                        };
                    }).filter(v => {
                        if (
                            (v.audio_codec === "none" || v.audio_codec === undefined) &&
                            (v.video_codec === "none" || v.video_codec === undefined)
                        )
                            return;
                        return v;
                    })
                });
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
        addHeader: ['referer:youtube.com', 'user-agent:googlebot'],
        noCheckCertificates: true,
    })
}