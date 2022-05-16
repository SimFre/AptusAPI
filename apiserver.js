
import express from "express";
import aptuslib from "./aptuslib.js";

const listenport = process.env.PORT ?? 3001;
const username = process.env.APTUS_USERNAME ?? "";
const password = process.env.APTUS_PASSWORD ?? "";
const chromePath = process.env.CHROME_PATH;
const baseurl = process.env.APTUS_BASEURL ?? "";

const aptus = new aptuslib(baseurl, username, password);
aptus.chromePath = chromePath;
aptus.headless = false;

const app = express();
app.get("/list", async (req, res) => {
    const auth = await aptus.authenticate();
    if (auth.status === true) {
        const doors = await aptus.listDoors();
        res.send(doors);
    }
    else {
        res.send(auth);
    }
});

app.get("/open/:doorId", async (req, res) => {
    const doorId = req.params.doorId;
    const auth = await aptus.authenticate();
    if (auth.status === true) {
        const jd = await aptus.unlockDoor(doorId);
        res.send(jd);
    }
    else {
        res.send(auth);
    }
});

app.listen(listenport, async () => {
    console.log(`
        App started on ${listenport}
        URL: ${baseurl}
        UN:  ${username}
        PW:  ${password}
    `);
    await aptus.initialize();
});
