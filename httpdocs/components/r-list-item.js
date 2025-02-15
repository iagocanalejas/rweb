const component = "r-list-item";
const template = document.createElement("template");

template.innerHTML = `
<div>testing</div>
`;

customElements.define(
    component,
    class extends HTMLElement {
        constructor() {
            super();
            const root = this.attachShadow({ mode: "open" });
            root.append(template.content.cloneNode(true));
        }

        connectedCallback() {}
    },
);
