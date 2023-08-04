import { RequestHandler } from "express";
import { HTTP } from "../type";
import googledrive from "@googleapis/drive";

let interval: NodeJS.Timer;

async function deleteOldFiles(
    drive: googledrive.drive_v3.Drive, 
    minutes_ms: number,
    folderID: string
) {
    const xhourago = new Date(Date.now() - minutes_ms).toISOString()
    const list = await drive.files.list({
        fields: "files(createdTime,id,name)",
        q: `'${folderID}' in parents and createdTime < '${xhourago}'`,
    });
    list.data.files!.forEach(file => {
        console.log(`Deleted ${file.name}.`);
        drive.files.delete({
            fileId: file.id!,
        })
    })
}

export const enableAutoDeletionf: HTTP<RequestHandler> = (drive, folderID) => {
    return {
        route: "/enableAutoDeletion",
        f: async (req, res) => {
            const minutes = req.body.minutes * 60 * 1000 ?? 60 * 60 * 1000;
            interval = setInterval(() => {
                deleteOldFiles(drive, minutes, folderID ?? "");
            }, Math.floor(minutes / 2));
            res.send(`Enabled auto deletion for ${minutes}ms.`);
        }
    }
}

export const disableAutoDeletionf: HTTP<RequestHandler> = (drive, folderID) => {
    return {
        route: "/disableAutoDeletion",
        f: async (req, res) => {
            clearInterval(interval);
            res.send(`Disabled auto deletion.`);
        }
    }
}