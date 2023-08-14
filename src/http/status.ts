import { RequestHandler } from "express";
import { HTTP } from "../type.js";
import { getAboutDrive } from "../helpers/drive.js";

const drive_fixed_size = 8053063680;

export const statusf: HTTP<RequestHandler> = (drive, folderID, folderSize) => {
    return {
        route: "/status",
        f: async (req, res) => {
            try {
                let hasReachedLimit = false;
                if (folderSize! > drive_fixed_size) {
                    hasReachedLimit = true;
                }
                const info = await getAboutDrive(drive);
                res.send({
                    hasReachedLimit: hasReachedLimit,
                    folderSize: folderSize,
                    ...info.data.storageQuota
                });
            } catch (err) {
                console.log(err);
                res.send(err);
            }
        }
    }
}