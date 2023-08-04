import ytdl from "youtube-dl-exec";
import path from "path";
import mime from "mime-types";
import ws, { WebsocketRequestHandler } from "express-ws";
import { select } from "../helpers/format_operators.js";
import { measureAverageDownloadSpeed } from "../helpers/average.js";
import { HTTP } from "../type.js";
import { drive_v3 } from "@googleapis/drive";
import { unlink, createReadStream } from "fs";

type WS = HTTP<WebsocketRequestHandler>;

// MESSY CODE WARNING

export const dlf: WS = (drive, folderID) => {
    return {
        route: "/ws",
        f: (ws, req) => {
            ws.on("message", async (data) => {
                await main(data, drive, folderID ?? "", ws as unknown as WebSocket);
            })
        }
    }
}

async function main(
    data: any,
    drive: drive_v3.Drive, 
    folderID: string,
    ws: WebSocket
) {
    try {
        const json: { link: string, best: number | undefined } = JSON.parse(data as any);

        const info = await getInfo(json.link);
        const mbytes = compressedVideoSizeCalculator(info.duration, info.tbr * 125, info.fps, 1);
        const average_speed = await measureAverageDownloadSpeed();

        ws.send(JSON.stringify({
            file: path.basename(info._filename),
            size_mbytes: mbytes,
            size_mbits: mbytes * 8,
            speed_mbits: average_speed.n,
            download_length_seconds: (mbytes * 8) / average_speed.n,
        }));

        const { yt_info, mimetype } = await downloadVideo(json.link, json.best ?? 1);

        ws.send(JSON.stringify({
            message: `Downloading ${json.link}.`,
        }));

        const response = await drive.files.create({
            requestBody: {
                name: path.basename(yt_info._filename),
                mimeType: mimetype ? mimetype : "",
                parents: [folderID]
            },
            media: {
                mimeType: mimetype ? mimetype : "",
                body: createReadStream(yt_info._filename)
            },
        });

        ws.send(JSON.stringify({
            message: `Creating permissions for ${response.data.name}.`
        }));

        await drive.permissions.create({
            fileId: response.data.id!,
            requestBody: {
                role: 'reader',
                type: 'anyone',
            }
        });
        const file_get = await drive.files.get({
            fileId: response.data.id!,
            fields: "name,webViewLink,webContentLink"
        });
        unlink(yt_info._filename, console.error);

        ws.send(JSON.stringify({
            name: file_get.data.name!,
            view: file_get.data.webViewLink,
            content: file_get.data.webContentLink,
            id: response.data.id
        }));

        ws.close(0);
        ws.send("");
    } catch (err) {
        ws.send(JSON.stringify(err));
        ws.close(1);
    }
}

async function getInfo(link: string, best?: number) {
    return await ytdl(link, {
        printJson: true,
        skipDownload: true,
        format: select("best", best ?? 1),
        output: "%(title)s.%(ext)s"
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
    fps: number,
    adjust: number
) {
    return (average_bits * duration_in_seconds * fps) / (8 * 1024 * 1024 * adjust)
}

async function downloadVideo(
    link: string,
    best: number,
) {
    const yt_info = await ytdl(link, {
        retries: 3,
        printJson: true,
        format: select("best", best),
        output: "media/%(uploader|No Uploader)s - %(title)s.%(ext)s",
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