import morgan from "morgan";
import express from "express";
import aptuslib from "./aptuslib.js";

const listenport = process.env.PORT ?? 3001;
const username = process.env.APTUS_USERNAME ?? "";
const password = process.env.APTUS_PASSWORD ?? "";
const baseurl = process.env.APTUS_BASEURL ?? "";

const aptus = new aptuslib(baseurl, username, password);
aptus.debug = true;

// Initialize the web server and it's logging
const app = express();
app.use(morgan("combined"));

app.get("/init", async (req, res) => {
    const action = await aptus.initialize();
    res.send(action);
});

app.get("/auth", async (req, res) => {
    const action = await aptus.authenticate();
    res.send(action);
});

app.get("/list", async (req, res) => {
    const action = await aptus.listDoors();
    res.send(action);
});

app.get("/unlock/:doorId", async (req, res) => {
    const doorId = req.params.doorId;
    const action = await aptus.unlockDoor(doorId);
    res.send(action);
});

app.get("/open/:doorId", async (req, res) => {
    await aptus.initialize();
    await aptus.authenticate();
    const doorId = req.params.doorId;
    const action = await aptus.unlockDoor(doorId);
    res.send(action);
});

app.listen(listenport, async () => {
    console.log(`
        App started on ${listenport}
        URL: ${baseurl}
        UN:  ${username}
        PW:  ${password}
    `);
    await aptus.initialize();
    await aptus.authenticate();
});
