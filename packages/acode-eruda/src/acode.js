import plugin from "../plugin.json";
import { Eruda } from "./lib/index.js";

if (window.acode) {
  const Instance = new Eruda();

  acode.setPluginInit(plugin.id, () => Instance.init(), Instance.setting);
  
  acode.setPluginUnmount(plugin.id, () => Instance.destroy());
  
}