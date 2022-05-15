
import puppeteer from "puppeteer";

export default class {
    constructor(baseurl, username, password) {
        this.baseurl = baseurl;
        this.username = username;
        this.password = password;
        this.browser = null;
        this.page = null;
        this.chromePath;
        this.headless = true;
    }

    async initialize() {
        const params = {
            headless: this.headless,
            defaultViewport: {
                width: 1024,
                height: 768,
            }
        };
        if (this.chromePath)
            params.executablePath = this.chromePath;

        this.browser = await puppeteer.launch();
        this.page = await this.browser.newPage();
    }

    async authenticate() {
        // Open the page
        await this.page.goto(this.baseurl + "/AptusPortalStyra/Account/Login");
        await this.page.waitForSelector('button[aria-label="English"]');
        await this.page.click('button[aria-label="English"]');
        await this.page.waitForSelector('#UserName');

        // Fill in credentials
        await this.page.type("#UserName", this.username);
        await this.page.type("#Password", this.password);

        // Select mobile version
        const labels = await this.page.$$('label');
        // console.log("Labels:", labels);
        labels.forEach(async (o, i) => {
            const labelProp = await o.getProperty('innerText');
            const labelText = labelProp._remoteObject?.value?.trim();
            if (labelText === 'Mobile') {
                o.click()
            }
        });

        // Login
        await this.page.waitForTimeout(100);
        await this.page.click("#btnLogin");
        await this.page.waitForSelector("body");
        if (await this.page.$('#popup_message') !== null) {
            const msgObj = await this.page.$('#popup_message');
            const msgProp = await msgObj.getProperty('innerText');
            const msgValue = await msgProp.jsonValue();
            return { "status": false, "message": msgValue };
        }
        else if (await this.page.$('#ShowMenuButton') !== null) {
            return { "status": true, "message": "success" };
        }
        else {
            return { "status": false, "message": "unknown" };
        }
    }

    async unlockDoor(doorId) {
        const response = await this.page.goto(this.baseurl + "/AptusPortalStyra/Lock/UnlockEntryDoor/" + doorId);
        try {
            const jsonData = await response.json();
            return jsonData;
        }
        catch (e) {
            const dStr = new Date().toISOString().replace(/[T:\-\+\.]/g, "");
            await this.page.screenshot({ path: 'unlock_' + dStr + '_' + doorId + '.png' });
            console.log(e);
        }
        return false;
    }

    async listDoors() {
        const response = await this.page.goto(this.baseurl + "/AptusPortalStyra/Lock");
        await this.page.waitForSelector('.lockCard');

        const lockCards = await this.page.$$('.lockCard');
        const doors = [];

        for (const card of lockCards) {
            try {
                const nameObj = await card.$('div > span');
                const nameProp = await nameObj.getProperty('innerText');
                const nameValue = await nameProp.jsonValue();

                const idObj = await card.$('.lockCardButton');
                const idAttr = await this.page.evaluate(el => el.getAttribute("id"), idObj);
                const idSplit = idAttr.split("_");
                const idValue = idSplit[1];

                doors.push({
                    "name": nameValue,
                    "id": idValue
                });
            }
            catch (e) {
                const dStr = new Date().toISOString().replace(/[T:\-\+\.]/g, "");
                await this.page.screenshot({ path: 'list_' + dStr + '_' + doorId + '.png' });
                console.log("Could not get value:", e.message);
            }
        };
        return doors;
    }

    close() {
        this.browser?.close();
    }
}
