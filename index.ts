import googledrive from "@googleapis/drive";
import express from "express";
import expressWs from "express-ws";
import url from "url";
import json from "./config.json" assert { type: "json" };
import { dlf } from "./src/ws/download.js";
import { listallf } from "./src/http/listall.js";
import { disableAutoDeletionf, enableAutoDeletionf } from "./src/http/autoDeletion.js";
import { measuref } from "./src/http/measure.js";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // quite dangerous ay?
const router = express.Router() as expressWs.Router;
const { app, getWss, applyTo } = expressWs(express());
app.use(express.json());
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
const measure = measuref(drive);
const enableAutoDeletion = enableAutoDeletionf(drive, folderID);
const disableAutoDeletion = disableAutoDeletionf(drive, folderID);
const dl = dlf(drive, folderID);

router.ws(dl.route, dl.f);
app.use("/download-ws", router);
app.get(listall.route, listall.f);
app.get(measure.route, measure.f);
app.post(disableAutoDeletion.route, disableAutoDeletion.f);
app.post(enableAutoDeletion.route, enableAutoDeletion.f);