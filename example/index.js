const GWrapper = require("../src/index");

let example_client = new GWrapper({
    splashWindow: {
        width: 400,
        height: 300,
        g_loadFile: "splash.html"
    }, mainWindow: {
        width: 800,
        height: 600,
        g_loadURL: "https://example.com"
    }
});

example_client.init();
