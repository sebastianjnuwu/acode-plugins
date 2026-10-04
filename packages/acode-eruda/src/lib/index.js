const settings = acode.require("settings");

export class Eruda {
  #instance = null;
  #loading = null;
  #onUpdate = (val) => this.toggle(val);

  constructor() {
    if (settings.get("developerMode") === undefined) {
      settings.update({ developerMode: false });
    }
  }

  async init() {
    settings.on('update:developerMode', this.#onUpdate);

    if (settings.get("developerMode")) {
      try {
        await this.toggle(true);
      } catch (error) {
        console.warn("[eruda]", error?.message || error);
      }
    }
  }

  loadScript() {
    if (this.#loading) return this.#loading;
    if (window.eruda) return Promise.resolve(window.eruda);

    this.#loading = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/eruda";
      script.onload = () => {
        this.#loading = null;
        if (window.eruda) resolve(window.eruda);
        else reject(new Error("eruda failed to initialize"));
      };
      script.onerror = () => {
        this.#loading = null;
        script.remove();
        reject(new Error("could not load eruda from CDN (offline?)"));
      };
      document.head.appendChild(script);
    });
    return this.#loading;
  }

  async toggle(enable) {
    if (enable) {
      if (this.#instance) return this.#instance.init();

      this.#instance = await this.loadScript();

      this.#instance.init({
        container: this.#getContainer(),
        useShadowDom: true,
        autoScale: true,
        defaults: { displaySize: 50, theme: 'Dark' }
      });
    } else {
      this.#loading = null;
      if (this.#instance) {
        try {
          this.#instance.destroy();
        } catch {
          // ignore
        }
        this.#instance = null;
        document.getElementById("eruda-plugin-container")?.remove();
      }
    }
  }

  #getContainer() {
    let container = document.getElementById("eruda-plugin-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "eruda-plugin-container";
      document.body.appendChild(container);
    }
    return container;
  }

  get setting() {
    return {
      list: [
        {
          key: "developerMode",
          text: "Ativar Eruda",
          checkbox: !!settings.get("developerMode"),
        }
      ],
      cb: (key, value) => {
        settings.update({ [key]: value });
      }
    };
  }

  async destroy() {
    settings.off('update:developerMode', this.#onUpdate);
    await this.toggle(false);
  }
}
