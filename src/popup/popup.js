/**
 * Farside Redirector - Popup Script
 *
 * Handles rendering the toggle list from browser.storage.local
 * and updates states on click.
 */

document.addEventListener("DOMContentLoaded", async () => {
  const servicesList = document.getElementById("services-list");
  const api = typeof browser !== "undefined" ? browser : chrome;

  try {
    const data = await api.storage.local.get(["services", "globalEnabled"]);
    const services = data.services;
    const isGlobalEnabled = data.globalEnabled !== false;

    if (!services) {
      servicesList.innerHTML = '<p class="error">Configuration not found. Please reload the extension.</p>';
      return;
    }

    // Initialize global toggle
    const globalToggle = document.getElementById("global-toggle");
    if (globalToggle) {
      globalToggle.checked = isGlobalEnabled;
      servicesList.classList.toggle("global-disabled", !isGlobalEnabled);

      globalToggle.addEventListener("change", async (e) => {
        const enabled = e.target.checked;
        servicesList.classList.toggle("global-disabled", !enabled);
        await api.storage.local.set({ globalEnabled: enabled });
        api.runtime.sendMessage({ action: "syncRules" });
      });
    }

    let alphaSortState = 0; // 0: 'a', 1: 'z', 2: '-'
    let stateSortState = true; // true: enabled first

    const btnAlpha = document.getElementById("sort-alpha");
    const btnState = document.getElementById("sort-state");
    const searchInput = document.getElementById("search-input");
    const noMatches = document.getElementById("no-matches");

    const alphaStates = ['a', 'z', '-'];

    function applySearch() {
      if (!searchInput) return;
      const query = searchInput.value.toLowerCase().trim();
      const rows = servicesList.getElementsByClassName("service-row");
      let hasVisible = false;
      for (const row of rows) {
        const name = row.dataset.name || "";
        const domains = row.dataset.domains || "";
        if (name.includes(query) || domains.includes(query)) {
          row.style.display = "";
          hasVisible = true;
        } else {
          row.style.display = "none";
        }
      }
      if (noMatches) {
        noMatches.style.display = hasVisible || rows.length === 0 ? "none" : "block";
      }
    }

    function renderServices() {
      servicesList.innerHTML = "";
      
      let entries = Object.entries(services).map(([key, service]) => ({key, service}));

      entries.sort((a, b) => {
        if (stateSortState) {
          if (a.service.enabled && !b.service.enabled) return -1;
          if (!a.service.enabled && b.service.enabled) return 1;
        }

        if (alphaSortState === 0) {
          return a.service.name.localeCompare(b.service.name);
        } else if (alphaSortState === 1) {
          return b.service.name.localeCompare(a.service.name);
        }
        
        return 0;
      });

      for (const {key, service} of entries) {
        const row = document.createElement("div");
        row.className = "service-row";
        row.dataset.name = service.name.toLowerCase();
        row.dataset.domains = service.domains.join(" ").toLowerCase();

        const label = document.createElement("label");
        label.className = "service-label";
        
        const title = document.createElement("span");
        title.className = "service-title";
        title.textContent = service.name;

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "service-toggle";
        checkbox.checked = service.enabled;

        checkbox.addEventListener("change", async (e) => {
          service.enabled = e.target.checked;
          await api.storage.local.set({ services });
          api.runtime.sendMessage({ action: "syncRules" });
        });

        const slider = document.createElement("span");
        slider.className = "slider";

        label.appendChild(checkbox);
        label.appendChild(slider);
        label.appendChild(title);

        const domainDesc = document.createElement("div");
        domainDesc.className = "service-domains";
        domainDesc.textContent = service.domains.join(", ");

        row.appendChild(label);
        row.appendChild(domainDesc);

        servicesList.appendChild(row);
      }
      applySearch();
    }

    if (btnAlpha) {
      btnAlpha.addEventListener("click", () => {
        alphaSortState = (alphaSortState + 1) % 3;
        btnAlpha.textContent = alphaStates[alphaSortState];
        renderServices();
      });
    }

    if (btnState) {
      btnState.addEventListener("click", () => {
        stateSortState = !stateSortState;
        if (stateSortState) {
          btnState.classList.add("active");
        } else {
          btnState.classList.remove("active");
        }
        renderServices();
      });
    }

    if (searchInput) {
      searchInput.addEventListener("input", applySearch);
    }

    renderServices();

    // Log background sync state for debugging
    const debugData = await api.storage.local.get("debugLog");
    console.log("Background Sync Log:", debugData.debugLog);
  } catch (error) {
    console.error("Error loading services:", error);
    servicesList.innerHTML = '<p class="error">Failed to load configuration.</p>';
  }
});
