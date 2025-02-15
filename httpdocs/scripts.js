import "./types.js";
import "./components/r-search.js";
import "./components/r-list.js";
import "./components/r-loading.js";
import { database } from "./modules/database.js";

/** @type HTMLElement */
const grid = document.querySelector("r-list");
/** @type HTMLElement */
const loading = document.querySelector("r-loading");

class App {
    /** @type {Race[]} */
    results = [];

    /** @param {number} progress */
    set loading(progress) {
        loading.progress = progress;
    }

    restore() {
        grid.restore();
    }
}

const app = new App();

await database.load();
app.results = database.records;

grid.append(0);

export { app };
