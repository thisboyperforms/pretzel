const { ipcRenderer, remote, shell } = require("electron");
const yaml = require("js-yaml");
const path = require("path");
const fs = require("fs");
const appName = document.querySelector(".app-name");
const shortcutsContainer = document.querySelector(".shortcuts-container");
const input = document.querySelector("#search");
const allAppsBtn = document.querySelector("#show-all-apps");
const quitAppBtn = document.querySelector("#quit-app");
const readmeUrl =
  "https://github.com/amiechen/pretzel/blob/master/README.md#add-a-shortcut";
const allAppsUrl = "https://www.amie-chen.com/pretzel/supported-apps";

function get(selector, scope) {
  scope = scope ? scope : document;
  return scope.querySelector(selector);
}

function getAll(selector, scope) {
  scope = scope ? scope : document;
  return scope.querySelectorAll(selector);
}

function searchShortcuts() {
  let filter = input.value.toUpperCase();
  let shortcuts = getAll(".shortcut");

  for (var i = 0; i < shortcuts.length; i++) {
    let label = get("label", shortcuts[i]);
    if (label.innerHTML.toUpperCase().indexOf(filter) > -1) {
      shortcuts[i].classList.remove("hide");
    } else {
      shortcuts[i].classList.add("hide");
    }
  }
}

function toggleTitles() {
  getAll(".shortcuts__group").forEach(group => {
    // if all shortcuts are hidden
    // we hide the title
    // otherwise we show the title
    if (
      getAll(".shortcut.hide", group).length ===
      getAll(".shortcut", group).length
    ) {
      get(".shortcuts__title", group).classList.add("hide");
    } else {
      get(".shortcuts__title", group).classList.remove("hide");
    }
  });
}

function getShortcutConfig(name) {
  try {
    const config = yaml.safeLoad(
      fs.readFileSync(path.join(__dirname, `shortcuts/${name}`), "utf8")
    );
    return config;
  } catch (e) {
    console.log(e);
  }
}

ipcRenderer.on("noShortcuts", (event, name) => {
  const html = `<div class="no-shortcuts">
    <div class="no-shortcuts__text">
      <p>No shortcuts found for <br><span class="app-name">${name}</span></p>
    </div>
    <div class="add-shortcut-btn" onClick="openReadmeURL()">Add shortcuts for ${name}</div>
  </div>`;
  const addShortcutBtn = document.querySelector(".add-shortcut-btn");

  appName.style.display = "none";
  input.style.display = "none";
  shortcutsContainer.innerHTML = html;
});

function openReadmeURL() {
  shell.openExternal(readmeUrl);
}

ipcRenderer.on("currentApp", (event, name) => {
  const shortcuts = getShortcutConfig(name);
  let html = "";

  get("#search").focus();

  for (var prop in shortcuts) {
    html += `<div class="shortcuts__group"><h3 class="shortcuts__title">${prop}</h3>`;
    shortcuts[prop].forEach(element => {
      html += `<div class="shortcut">
        <label class="shortcut__key"><span>${Object.keys(
          element
        )}</span></label>
        <label class="shortcut__name"><span>${
          Object.values(element)[0]
        }</span></label>
      </div>`;
    });
    html += "</div>";
  }

  appName.innerHTML = name.split(".yml")[0];
  shortcutsContainer.innerHTML = html;
  appName.style.display = "";
  input.style.display = "";
});

input.addEventListener("keyup", () => {
  searchShortcuts();
  toggleTitles();
});

allAppsBtn.addEventListener("click", () => {
  shell.openExternal(allAppsUrl);
});

quitAppBtn.addEventListener("click", () => {
  remote.app.quit();
});
