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
    const data = await api.storage.local.get("services");
    const services = data.services;

    if (!services) {
      servicesList.innerHTML = '<p class="error">Configuration not found. Please reload the extension.</p>';
      return;
    }

    servicesList.innerHTML = "";

    for (const [key, service] of Object.entries(services)) {
      const row = document.createElement("div");
      row.className = "service-row";

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
  } catch (error) {
    console.error("Error loading services:", error);
    servicesList.innerHTML = '<p class="error">Failed to load configuration.</p>';
  }
});
