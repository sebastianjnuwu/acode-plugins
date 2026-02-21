const app = acode.require("settings");

export class Eruda {
  constructor() {
    this.isenable = true;

    if (!app.value["developerMode"]) {
      app.value["developerMode"] = this.isenable;
      app.update(false);
    }
  }

  async init() {
    if (!this.settings.enable) return;

    const eruda = (await import("eruda")).default || (await import("eruda"));
    eruda.init();
  }

  get setting() {
    return {
      list: [
        {
          key: "enable",
          text: "Enable Eruda?",
          checkbox: this.settings.enable,
          info: 'If checked, Eruda is enabled.'
        }
      ],
      cb: async (key, value) => {
        this.settings[key] = value;
        app.update();

        const eruda = (await import("eruda")).default || (await import("eruda"));
        this.settings.enable ? eruda.init() : eruda.destroy();
      },
    };
  }

  get settings() {
    return app.value["developerMode"];
  }

  async destroy() {
    const eruda = (await import("eruda")).default || (await import("eruda"));
    eruda.destroy();
    delete app.value["developerMode"];
    app.update(false);
  }
}