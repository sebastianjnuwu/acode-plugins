const settings = acode.require("settings");

export class Eruda {
  constructor() {
    if (settings.get("developerMode") === undefined) {
      settings.update({ developerMode: false }, false);
    }
  }

  async init() {
    if (settings.get("developerMode")) {
      await this.loadEruda(true);
    }

    settings.on('update:developerMode', (value) => {
      console.log('Developer mode changed to:', value);
      this.loadEruda(value);
    });

  }

  async loadEruda(enable) {
    try {
      const eruda = (await import("eruda")).default || (await import("eruda"));
      enable ? eruda.init() : eruda.destroy();
    } catch (e) {
      alert(e.message);
    }
  }


  get setting() {
    return {
      list: [
        {
          key: "developerMode",
          text: "Enable Eruda?",
          checkbox: !!settings.get("developerMode"),
          info: "Enable or disable Eruda console.",
        },
      ],
      cb: async (key, value) => {
        settings.update({ [key]: value });
        await this.loadEruda(value);
      },
    };
  }

  async destroy() {
    await this.loadEruda(false);
  }
}