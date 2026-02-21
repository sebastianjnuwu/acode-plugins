const settings = acode.require("settings");

export class Eruda {
  #instance = null;

  constructor() {
    if (settings.get("developerMode") === undefined) {
      settings.update({ developerMode: false }, false);
    }
  }

  async init() {
    settings.on('update:developerMode', (val) => this.toggle(val));
    
    if (settings.get("developerMode")) {
      await this.toggle(true);
    }
  }

  async toggle(enable) {
    if (enable) {
      if (this.#instance) return this.#instance.init();

      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/eruda";
      
      script.onload = () => {
        this.#instance = window.eruda;
        window.myCustomEruda = this.#instance; 
        delete window.eruda; 

        this.#instance.init({
          container: this.#getContainer(),
          useShadowDom: true,
          autoScale: true,
          defaults: { displaySize: 50, theme: 'Dark' }
        });
      };
      
      document.head.appendChild(script);
    } else {
      if (this.#instance) {
        this.#instance.destroy();
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
    settings.off('update:developerMode');
    await this.toggle(false);
  }
}