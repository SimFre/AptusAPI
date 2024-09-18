import HTMLParser from "node-html-parser";

export default class {
    constructor(baseurl, username, password) {
        this.baseurl = baseurl + "/AptusPortalStyra";
        this.username = username;
        this.password = password;
        this.debug = false;
        this.session = "";
        this.authtoken = "";
        this.cookies = [];
        this.doors = [];
    }

    getCookie(headers, name) {
        const jar = headers.getSetCookie();
        for (let cookie of jar) {
            const parts = cookie.split(/[=;]/);
            if (name == parts[0])
                return {
                    name: parts[0],
                    value: parts[1],
                };
        }
        return false;
    }

    encodePassword(password, salt) {
        let encode = "";
        for (let i = 0; i < password.length; ++i) {
            encode += String.fromCharCode(salt ^ password.charCodeAt(i));
        }
        return encode;
    }

    async initialize() {
        // Establish a session
        if (this.debug) console.debug("Initializing");
        const req = await fetch(this.baseurl + "/Account/SetCustomerLanguage?lang=en-GB", {
            credentials: "include",
            redirect: "manual",
        });
        const session = this.getCookie(req.headers, "ASP.NET_SessionId");
        this.session = session?.value ?? "";
        if (this.debug) console.debug("SessionID: ", this.session);
        if (this.debug) console.debug("Body Resp: ", await req.text());
        return this.session;
    }

    async authenticate() {
        // Retrieve the start page
        if (this.debug) console.debug("Authenticating");
        const req1 = await fetch(this.baseurl + "/Account/Login", {
            credentials: "include",
            redirect: "manual",
            headers: {
                // FIXME use cookie jar
                Cookie: "ASP.NET_SessionId=" + this.session,
            },
        });

        // Parse the body into a queryable object
        const body = await req1.text();
        const html = HTMLParser.parse(body);
        //if (this.debug) console.debug("Response", body);

        // Get the request verification token
        const rvtObject = html.querySelector("input[name=__RequestVerificationToken]");
        const rvtString = rvtObject._attrs.value;

        // Get the password salt
        const saltObject = html.querySelector("#PasswordSalt");
        const saltString = saltObject._attrs.value;

        // Prepare authentication request
        const pwenc = this.encodePassword(this.password, saltString);
        const authform = new URLSearchParams({
            DeviceType: "PC",
            DesktopSelected: "true",
            __RequestVerificationToken: rvtString,
            UserName: this.username,
            Password: this.password,
            PwEnc: pwenc,
            PasswordSalt: saltString,
        });
        if (this.debug) console.debug("Auth Form:", authform);

        // Send the login request
        // FIXME test if the URL can redirect to AptusPortalStyra/Lock/UnlockEntryDoor/doorId
        const req2 = await fetch(
            this.baseurl + "/Account/Login?ReturnUrl=/AptusPortalStyra/Lock",
            {
                method: "post",
                credentials: "include",
                redirect: "manual",
                headers: {
                    // FIXME use cookie jar
                    Cookie: "ASP.NET_SessionId=" + this.session,
                },
                body: authform,
            }
        );

        // FIXME do I need to await for the text to get headers?
        //const r2body = await req2.text();
        const authtoken = this.getCookie(req2.headers, ".ASPXAUTH");
        this.authtoken = authtoken?.value ?? "";

        if (this.debug) console.debug("Auth Token:", this.authtoken);
        return this.authtoken;
    }

    async unlockDoor(doorId) {
        if (this.debug) console.debug("Unlock", doorId);
        const req = await fetch(this.baseurl + "/Lock/UnlockEntryDoor/" + doorId, {
            method: "get",
            credentials: "include",
            redirect: "manual",
            headers: {
                // FIXME use cookie jar
                Cookie: "ASP.NET_SessionId=" + this.session + ";.ASPXAUTH=" + this.authtoken,
            },
        });
        const respCode = req.status;
        const respText = req.statusText;
        let respBody = await req.text();
        let respJson = -1;
        try {
            respJson = JSON.parse(respBody);
            respBody = respJson;
        } catch (ex) {
            if (this.debug) console.error(ex);
            respBody = { StatusText: "Invalid door", HeaderStatusText: "Error" };
        }
        if (this.debug) console.debug("Unlock", respCode, respText, respBody);
        return respBody;
    }

    async listDoors() {
        if (this.debug) console.debug("ListDoors");
        this.doors = [];
        const req = await fetch(this.baseurl + "/Lock", {
            method: "get",
            credentials: "include",
            redirect: "manual",
            headers: {
                // FIXME use cookie jar
                Cookie: "ASP.NET_SessionId=" + this.session + ";.ASPXAUTH=" + this.authtoken,
            },
        });

        const body = await req.text();
        const html = HTMLParser.parse(body);

        // .lockCard @id
        // split by _ to get door id (entranceDoorButton_3438)
        // .lockCard span to get description
        const entries = html.querySelectorAll(".lockCard");
        for (let entry of entries) {
            const s = entry.id.split("_");
            const h = HTMLParser.parse(entry.toString());
            const span = h.querySelector("span");
            const desc = span.childNodes[0]._rawText;
            console.log(entry.id, desc);
            this.doors.push({ name: desc, id: s[1] });
        }
        return this.doors;
    }

    close() {
        return;
    }
}
