import googledrive from "@googleapis/drive";
import express from "express";
import json from "./config.json" assert { type: "json" };
import cors from "cors";

import { listallf } from "./src/http/listall.js";
import { disableAutoDeletionf, enableAutoDeletionf } from "./src/http/autoDeletion.js";
import { measuref } from "./src/http/measure.js";
import { downloadf } from "./src/http/download.js";
import { uploadf } from "./src/http/upload.js";
import { infof } from "./src/http/info.js";
import { checklinkf } from "./src/http/check.js";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // quite dangerous ay?

const app = express();
app.use(express.json());
app.use(cors());
app.listen(3000, () => {
    console.log("Listening to port 3000.");
});

const folderID = "18Dtd9oz8HrgDiixqC18jU9eufy75d22l";
const oauth2Client = new googledrive.auth.OAuth2(json.clientID, json.clientSecret, json.redirectURI);
oauth2Client.setCredentials({ refresh_token: json.token })
const drive = googledrive.drive({
    version: 'v3',
    auth: oauth2Client
});

const listall = listallf(drive, folderID);
const measure = measuref(drive, folderID);
const enableAutoDeletion = enableAutoDeletionf(drive, folderID);
const disableAutoDeletion = disableAutoDeletionf(drive, folderID);
const download = downloadf(drive, folderID);
const upload = uploadf(drive, folderID);
const info = infof(drive, folderID);
const check = checklinkf(drive);

app.get(listall.route, listall.f);
app.get(measure.route, measure.f);
app.post(check.route, check.f);
app.post(info.route, info.f);
app.post(disableAutoDeletion.route, disableAutoDeletion.f);
app.post(enableAutoDeletion.route, enableAutoDeletion.f);
app.post(download.route, download.f);
app.post(upload.route, upload.f);