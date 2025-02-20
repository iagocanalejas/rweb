const component = "r-search";
const template = document.createElement("template");

const icon = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
  </svg>
`;

template.innerHTML = `
  <style>
    label {
      position: relative;
      display: flex;
      font-size: 16px;
      width: 15em;
      align-items: center;
      transition: width 350ms ease;
    }

    label:focus-within {
      width: 22em;
    }

    label svg {
      position: absolute;
      width: 1em;
      left: .65em;
      fill: var(--color-neutral-500);
      pointer-events: none;
    }

    label input {
      font-size: inherit;
      font-weight: 500;
      width: 100%;
      border: none;
      border-radius: 1rem;
      padding: .35em .25em .35em 2.25em;
      outline: none;
      background: var(--color-neutral-200);
      transition: background 350ms ease;
      border: 1px solid var(--color-neutral-900);
      box-shadow: 0 0 0 1px var(--color-neutral-50);
      cursor: pointer;
      appearance: none;
      -webkit-appearance: none;
    }

    label input:hover,
    label input:focus {
      background: white;
    }

    label.open input:focus {
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
    }

    label ul {
      display: none;
      position: absolute;
      z-index: 1;
      top: 29px;
      left: 0;
      width: 100%;
      max-height: 70vh;
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      list-style: none;
      background: white;
      border-bottom-left-radius: 1rem;
      border-bottom-right-radius: 1rem;
      font-weight: 500;
      color: var(--color-neutral-800);
      overflow: scroll;
      box-shadow: 0 1px 0 1px var(--color-neutral-50);
      border: 1px solid var(--color-neutral-900);
      border-top: none;
    }

    label.open ul {
      display: block;
    }

    label ul li a {
      display: block;
      padding: 8px var(--gap) 8px 35px;
      text-decoration: none;
      color: inherit;
    }

    label ul li a.selected {
      background: var(--color-neutral-200);
    }

    label ul li a svg {
      position: absolute;
    }

    label ul li a mark {
      font-weight: 700;
      background: inherit;
      text-decoration: underline;
      text-decoration-style: dotted;
      text-decoration-thickness: 2px;
    }

    @media (max-width: 1280px) {
      label {
        font-size: 15px;
      }

      label:focus-within {
        width: 18rem;
      }
    }

    @media (max-width: 1024px) {
      label {
        width: 12rem;
      }

      label:focus-within {
        width: 15rem;
      }
    }

    @media (max-width: 768px) {
      label {
        font-size: 14px;
        width: 8rem;
      }

      label:focus-within {
        width: 12rem;
      }
    }

    @media (max-width: 640px) {
      label {
        font-size: 13px;
        width: 2rem;
      }
    }
  </style>
  <label>
    ${icon}
    <input type="search" placeholder="Buscar…" />
    <ul></ul>
  </label>
`;

customElements.define(
	component,

	class extends HTMLElement {
		label;
		input;
		value;
		ul;

		constructor() {
			super();
			const root = this.attachShadow({ mode: "open" });
			root.append(template.content.cloneNode(true));
		}

		connectedCallback() {
			this.label = this.shadowRoot.querySelector("label");
			this.input = this.shadowRoot.querySelector("input");
			this.ul = this.shadowRoot.querySelector("ul");

			document.addEventListener("keydown", (event) => {
				if (event.key.length === 1 || event.key === "Backspace") {
					this.input.focus();
				}

				const actions = {
					Escape: () => this.label.classList.remove("open"),
					// TODO: implement navegation, this used to work
					Enter: () => this.results[this.selected]?.click(),
				};

				if (!actions[event.key]) {
					return;
				}

				actions[event.key]();

				event.preventDefault();
			});

			this.input.addEventListener("input", () => {
				this.query = this.input.value;
			});

			this.input.addEventListener("focus", () => {
				this.label.classList.toggle("open", this.results?.length);

				const end = this.input.value.length;
				this.input.setSelectionRange(end, end);
			});

			this.input.addEventListener("blur", () => {
				setTimeout(() => this.label.classList.remove("open"), 100);
			});

			window.addEventListener("popstate", () => {
				const url = new URL(document.location.href);
				this.query = url.searchParams.get("q");
			});
		}

		get query() {
			return this.value;
		}

		set query(value) {
			this.value = this.input.value = value ?? "";
			this.dispatchEvent(new CustomEvent("onsearch", { detail: value }));
		}
	},
);
