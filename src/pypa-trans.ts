import { TemplatePreloader } from "./module/helper/TemplatePreloader";
import * as translations from "./translations";

Hooks.on("renderActorSheet", async function (sheet: any) {
  const actor = sheet.object;
  const buttonId = "pypa-trans-button";
  let translateMenu = document.getElementById(buttonId);
  if (!translateMenu) {
    const menuNax = document
      .querySelector(".sheet.actor")
      ?.getElementsByClassName("window-header")[0];
    console.log(menuNax);
    translateMenu = document.createElement("a");
    translateMenu.id = buttonId;
    translateMenu.className = "header-button";
    translateMenu.innerText = "PYPA-TRANS";
    menuNax?.lastElementChild?.before(translateMenu);
  }
  translateMenu.onclick = async () => await translateActor(actor);
});

const translateActor = async (actor: Actor) => {
  if (!actor) {
    console.log("NO ACTOR FOUND");
    return;
  }
  for (const itemType of Object.keys(actor.itemTypes)) {
    const type = [
      "backpack",
      "equipment",
      "consumable",
      "loot",
      "tool",
      "weapon",
    ].includes(itemType)
      ? "items"
      : ["class", "feat", "background"].includes(itemType)
      ? "perk"
      : itemType;
    if (type in translations) {
      for (const item of actor.itemTypes[itemType]) {
        const itemName = item.data.name
          .toLowerCase()
          .replace(/[^A-Z0-9]+/gi, "_");
        if (!(itemName in translations[type])) {
          continue;
        }
        const itemTranslation = translations[type][itemName].description || "";
        const itemRuTitle = translations[type][itemName].titleRu.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.substring(1)).join(' ') || "";
        const itemId = item._id;
        await item.update({
          _id: itemId,
          "data.description.value": itemTranslation,
          "data.name": itemRuTitle,
          "name": itemRuTitle,
        });
      }
    }
  }
};

if (process.env.NODE_ENV === "development") {
  if (module.hot) {
    module.hot.accept();

    if (module.hot.status() === "apply") {
      for (const template in _templateCache) {
        if (Object.prototype.hasOwnProperty.call(_templateCache, template)) {
          delete _templateCache[template];
        }
      }

      TemplatePreloader.preloadHandlebarsTemplates().then(() => {
        for (const application in ui.windows) {
          if (Object.prototype.hasOwnProperty.call(ui.windows, application)) {
            ui.windows[application].render(true);
          }
        }
      });
    }
  }
}
