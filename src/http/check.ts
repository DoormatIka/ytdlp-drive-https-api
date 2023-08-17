import fetch from "node-fetch";
import URL from "url";
import ytdl from "youtube-dl-exec";
import { RequestHandler } from "express";
import { HTTP } from "../type.js";

type CheckResult = "NO_LINK" | "NO_PATH_NAME" | "NOT_YOUTUBE" | "NOT_VIDEO" | "TOO_LONG" | "INVALID_FORMAT_ID";

export const checklinkf: HTTP<RequestHandler> = (drive) => {
    return {
        route: "/checklink",
        f: async (req, res) => {
            try {
                const reasons = checkURLifYouTubeVideo(req.body.link);
                if (reasons.length < 1) {
                    const info = await getInfo(req.body.link);
                    if (info.duration > 7200) {
                        reasons.push("TOO_LONG");
                    }
                    if (req.body.format_id) {
                        const format = info.formats.filter(v => v.format_id === req.body.format_id)[0];
                        if (format === undefined) {
                            reasons.push("INVALID_FORMAT_ID");
                        }
                    }
                }
                // await checkForRedirects(req.body.link);
                res.send({
                    reasons: reasons
                })
            } catch (err) {
                // console.log(err);
                res.send(err);
            }
        }
    }
}

function checkURLifYouTubeVideo(link: string): CheckResult[] {
    const q = URL.parse(link, true);
    const reasons: CheckResult[] = [];
    if (!q.host || q.host.length === 0) {
        reasons.push("NO_LINK");
        return reasons;
    }
    if (!q.pathname) {
        reasons.push("NO_PATH_NAME");
        return reasons;
    }

    if (!["www.youtube.com", "youtu.be", "youtube.com"].includes(q.host)) {
        reasons.push("NOT_YOUTUBE");
        return reasons;
    }
    // www.youtube.com parsing
    if (["www.youtube.com", "youtube.com"].includes(q.host)) {
        const matcher = q.pathname.split("/");
        if (!["watch", "shorts"].includes(matcher[1])) {
            reasons.push("NOT_VIDEO");
        }
    }
    return reasons;
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

async function checkForRedirects(link: string) {
    await fetch(link, {
        redirect: "error"
    })
}