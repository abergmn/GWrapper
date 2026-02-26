# gwrapper

A minimal Electron.js wrapper with splash and main window support.

## Usage Example

```js
const GWrapper = require("gwrapper");

const app = new GWrapper({
    splashWindow: {
        width: 800, height: 600,
        g_loadFile: "html/splash.html"
    },
    mainWindow: {
        width: 800, height: 600,
        g_loadURL: "https://example.com/"
    },
});

app.init();
```

## Run

Install dependencies and run the test entry point:

```bash
npm install
npm test
```

## License

MIT. See the [LICENSE](LICENSE) file for details.
