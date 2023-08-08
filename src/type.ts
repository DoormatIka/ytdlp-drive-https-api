import googledrive from "@googleapis/drive";

export type HTTP<T> = (drive: googledrive.drive_v3.Drive, folderID?: string, folderSize?: number) => { route: string, f: T };