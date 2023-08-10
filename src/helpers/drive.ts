import googledrive from "@googleapis/drive";


export async function cacheFolderDataSize(drive: googledrive.drive_v3.Drive, folderID: string) {
    let nextPageToken = " ";
    const results: number[] = [];
    while (nextPageToken.length > 0) {
        const cache = await drive.files.list({
            fields: "files(size)",
            q: `'${folderID}' in parents`,
        });
        results.push(...(cache.data.files ?? []).map(v => Number(v.size!)));
        nextPageToken = cache.data.nextPageToken ?? "";
    }
    if (results.length < 2) {
        return 0;
    }
    return results.reduce((prev, curr) => prev + curr);
}

export async function getAboutDrive(drive: googledrive.drive_v3.Drive) {
    return await drive.about.get({
        fields: "storageQuota",
    })
}