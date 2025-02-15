import "./r-list-item.js";
import { app } from "../scripts.js";

const component = "r-list";
const template = document.createElement("template");

template.innerHTML = `
<style>
	main {
		position: relative;
		top: calc(var(--header-height) + var(--gap));
		width: 100%;
		transition: 750ms ease transform;
	}
    hr {
      position: absolute;
      left: 0;
      width: 100%;
      height: 1px;
      border: none;
    }
</style>
<main></main>
<hr/>
`;

customElements.define(
    component,
    class extends HTMLElement {
        /** @type HTMLElement */
        container;
        /** @type HTMLElement */
        hr;
        ready = false;
        itemsPerPage = 50;
        page = 0;

        constructor() {
            super();
            const root = this.attachShadow({ mode: "open" });
            root.append(template.content.cloneNode(true));
        }

        connectedCallback() {
            this.container = this.shadowRoot.querySelector("main");
            this.hr = this.shadowRoot.querySelector("hr");

            const observer = new IntersectionObserver(this.onLoadMore.bind(this), {
                rootMargin: "0px",
                threshold: 0,
            });
            observer.observe(this.hr);

            // this.container.addEventListener("click", async (event) => {
            //     const id = event.target.getAttribute("id");
            //     if (!id) {
            //         return;
            //     }
            //
            //     const image = event.target;
            //
            //     const selected = this.container.querySelector("rs-image.selected");
            //     selected && (selected.areas = false);
            //
            //     this.zoom(image);
            //
            //     if (selected) {
            //         return;
            //     }
            //
            //     image.classList.add("selected");
            //
            //     const url = app.project.details(id);
            //     const { areas, faces, objects, tags } = await database.parse(url);
            //
            //     const details = database.find(id);
            //
            //     image.areas = areas;
            //     app.panel = { details, faces, objects, tags };
            // });

            document.addEventListener("keyup", (event) => {
                event.key === "Escape" && this.restore();
            });

            //window.addEventListener("resize", this.arrange.bind(this));
        }

        /** @param {IntersectionObserverEntry[]} */
        onLoadMore(intersections) {
            const intersection = intersections[0];
            if (!this.ready || !intersection.isIntersecting) {
                return;
            }

            this.append(++this.page);
        }

        append(page = 0) {
            this.ready = false;
            this.page = page;
            app.loading = 1;

            if (!page) {
                this.clear();
            }

            const start = page * this.itemsPerPage;
            const end = (1 + page) * this.itemsPerPage;
            const races = app.results.slice(start, end).map((result) => result.id);

            if (!races.length) {
                return;
            }

            this.container.innerHTML += races.map((id, _) => `<r-list-item id="${id}"></r-list-item>`).join("");
            this.arrange();
        }

        arrange() {
            const style = getComputedStyle(this.container);
            const gap = parseFloat(style.getPropertyValue("--gap").match(/\d+/)[0]);
            const headerHeight = parseFloat(style.getPropertyValue("--header-height").match(/\d+/)[0]);

            const races = [...this.container.querySelectorAll("r-list-item")];

            if (!races.length) {
                return;
            }

            const offset = this.container.getBoundingClientRect().top;
            const bottommost = races
                .map((race) => race.getBoundingClientRect().bottom - offset)
                .reduce((max, current) => (max = Math.max(max, current)), 0);

            this.container.style.height = `${bottommost + gap}px`;
            this.hr.style.top = `${bottommost + gap + headerHeight}px`;

            this.ready = true;
        }

        clear() {
            this.container.innerHTML = "";
            this.container.style.height = 0;
            this.hr.style.top = "";
        }

        restore() {
            this.container.style.transform = "";
            [...this.container.querySelectorAll("r-list-item")].forEach((item) => {
                item.classList.remove("selected");
                item.areas = false;
            });
        }
    },
);
