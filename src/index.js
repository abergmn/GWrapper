const { app, BrowserWindow } = require("electron");
const log = require("electron-log");
const path = require("path");

class GWrapper {
    constructor(t_wrapper_arguments) {
        this.wrapperArgs = t_wrapper_arguments;
        this.mainWindow = null;
        this.splashWindow = null;
        this._mainReady = false;
    }

    #_combineBrowserWindowOptions(t_default_options, t_custom_options) {
        return {
            ...t_default_options,
            ...t_custom_options,
            webPreferences: {
                ...t_default_options.webPreferences,
                ...(t_custom_options.webPreferences || {})
            }
        };
    }

    #_initMainWindow(t_window_options) {
        log.info("Initializing main window...");

        const defaultBrowserWindowOptions = {
            show: false
        };
    
        this.mainWindow = new BrowserWindow(this.#_combineBrowserWindowOptions(
            defaultBrowserWindowOptions, t_window_options || {}));

        this.mainWindow.removeMenu();

        try {
            const loadURLOpt = t_window_options && t_window_options.g_loadURL;
            const loadFileOpt = t_window_options && t_window_options.g_loadFile;

            if (loadURLOpt) {
                const url = (typeof loadURLOpt === "function") ? loadURLOpt() : loadURLOpt;
                this.mainWindow.loadURL(url);
            } else if (loadFileOpt) {
                const fileArg = (typeof loadFileOpt === "function") ? loadFileOpt() : loadFileOpt;
                const resolved = path.isAbsolute(fileArg) ? fileArg : path.join(app.getAppPath(), fileArg);
                this.mainWindow.loadFile(resolved);
            } else {
                log.info("No main load target provided; using default URL.");
                this.mainWindow.loadURL("https://example.com");
            }
        } catch (err) {
            log.error("Failed to load main window URL/file:", err);
        }

        this.mainWindow.once("ready-to-show", () => {
            this._mainReady = true;
            this.mainWindow.show();

            if (this.splashWindow) {
                this.splashWindow.destroy();
                this.splashWindow = null;
            }
        });
    }

    #_initSplashWindow(t_window_options) {
        log.info("Initializing splash window...");

        const defaultBrowserWindowOptions = {
            frame: false,
            resizable: false,
            movable: false,
            center: true,
            show: false
        }
    
        this.splashWindow = new BrowserWindow(this.#_combineBrowserWindowOptions(
            defaultBrowserWindowOptions, t_window_options || {}));

        this.splashWindow.removeMenu();
        
        try {
            const loadURLOpt = t_window_options && t_window_options.g_loadURL;
            const loadFileOpt = t_window_options && t_window_options.g_loadFile;

            if (loadURLOpt) {
                const url = (typeof loadURLOpt === "function") ? loadURLOpt() : loadURLOpt;
                this.splashWindow.loadURL(url);
            } else if (loadFileOpt) {
                const fileArg = (typeof loadFileOpt === "function") ? loadFileOpt() : loadFileOpt;
                const resolved = path.isAbsolute(fileArg) ? fileArg : path.join(app.getAppPath(), fileArg);
                this.splashWindow.loadFile(resolved);
            } else {
                this.splashWindow.loadFile(path.join(__dirname, "html/splash.html"));
            }
        } catch (err) {
            log.error("Failed to load splash window URL/file:", err);
        }

        this.splashWindow.webContents.once("did-finish-load", () => {
            this.splashWindow.show();
            if (this._mainReady && this.mainWindow) {
                this.mainWindow.show();
                this.splashWindow.destroy();
            }
        });
    }

    #_initWindows() {
        log.info("Initializing windows...");

        this.#_initMainWindow(this.wrapperArgs.mainWindow);
        if (this.wrapperArgs.splashWindow) {
            this.#_initSplashWindow(this.wrapperArgs.splashWindow);
        }
    }

    init() {
        log.info("Initializing application...");

        app.whenReady().then(() => {
            this.#_initWindows();

            app.on("activate", () => {
                if (BrowserWindow.getAllWindows().length === 0) {
                    this.#_initWindows();
                }
            });
        });

        app.on("window-all-closed", () => {
            if (process.platform !== "darwin") {
                app.quit()
            }
        });
    }

    die() {
        if (this.mainWindow) this.mainWindow.close();
        if (this.splashWindow) this.splashWindow.close();
    }
}

module.exports = GWrapper;
