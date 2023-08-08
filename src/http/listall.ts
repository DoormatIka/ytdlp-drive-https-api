import { RequestHandler } from "express";
import { HTTP } from "../type"

export const listallf: HTTP<RequestHandler> = (drive, folderID) => {
    return {
        route: "/listall",
        f: async (req, res) => {
            const list = await drive.files.list({
                fields: "files(name,createdTime,webContentLink,size)",
                q: `'${folderID}' in parents`
            });
            res.send(list.data);
        }
    }
}