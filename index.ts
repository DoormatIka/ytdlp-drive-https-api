import googledrive from "@googleapis/drive";
import ytdl from "youtube-dl-exec";
import express from "express";
import url from "url";
import mime from "mime-types";
import json from "./config.json" assert { type: "json" };
import path from "path";
import { createReadStream } from "fs";
import { select } from "./src/format_operators.js";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // quite dangerous ay?
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

let interval: NodeJS.Timer;

const app = express();
app.use(express.json());
app.listen(3000, () => {
    console.log("Listening to port 3000.");
});
const folderID = "18Dtd9oz8HrgDiixqC18jU9eufy75d22l";
const oauth2Client = new googledrive.auth.OAuth2(json.clientID, json.clientSecret, json.redirectURI)
oauth2Client.setCredentials({ refresh_token: json.token })
const drive = googledrive.drive({
    version: 'v3',
    auth: oauth2Client
});

app.post("/download", async (req, res) => {
    try {
        const yt_info = await ytdl(req.body.link, {
            retries: 3,
            printJson: true,
            keepVideo: true,
            format: select("best", 2),
            output: "media/%(uploader|No Uploader)s - %(title)s.%(ext)s",
            addHeader: [
                "referer:youtube.com",
                "user-agent:googlebot",
            ]
        });
        const mimetype = mime.lookup(yt_info._filename);
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
        })
        res.send({
            name: file_get.data.name!,
            view: file_get.data.webViewLink,
            content: file_get.data.webContentLink,
            ...{
                id: response.data.id
            }
        });
    } catch (error) {
        res.send(error);
    }
});

app.get("/listall", async (req, res) => {
    const list = await drive.files.list({
        fields: "files(name,createdTime,webContentLink)",
        q: `'${folderID}' in parents`
    });
    res.send(list.data);
});

app.post("/enableAutoDeletion", async (req, res) => {
    const minutes = req.body.minutes * 60 * 1000 ?? 60 * 60 * 1000;
    interval = setInterval(() => {
        initialize(minutes);
    }, Math.floor(minutes / 2));
    res.send(`Enabled auto deletion for ${minutes}ms.`);
});
app.post("/disableAutoDeletion", async (req, res) => {
    clearInterval(interval);
    res.send(`Disabled auto deletion.`)
})

async function initialize(minutes_ms: number) {
    const oneHourAgo = new Date(Date.now() - minutes_ms).toISOString()
    const list = await drive.files.list({
        fields: "files(createdTime,id,name)",
        q: `'${folderID}' in parents and createdTime < '${oneHourAgo}'`,
    });
    list.data.files!.forEach(file => {
        drive.files.delete({
            fileId: file.id!,
        })
    })
}