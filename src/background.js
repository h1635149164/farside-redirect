/**
 * Farside Redirector - Background Service Worker
 *
 * Implements rule synchronization with browser.declarativeNetRequest
 * when the configuration in browser.storage.local changes.
 */

const syncRules = async () => {
  // Use browser API (Firefox), fallback to chrome API if needed
  const api = typeof browser !== "undefined" ? browser : chrome;
  
  try {
    const { services, globalEnabled } = await api.storage.local.get(["services", "globalEnabled"]);
    if (!services) {
      await api.storage.local.set({ debugLog: "Error: Services configuration missing in storage." });
      return;
    }

    const rules = [];
    let idCounter = 1;

    const isGlobalEnabled = globalEnabled !== false;

    if (isGlobalEnabled) {
      for (const [key, service] of Object.entries(services)) {
        if (service.enabled) {
          for (const domain of service.domains) {
            // Escape the domain for regex
            const escapedDomain = domain.replace(/\./g, '\\.');
            rules.push({
              id: idCounter++,
              priority: 1,
              action: {
                type: "redirect",
                redirect: {
                  regexSubstitution: "https://farside.link/\\1"
                }
              },
              condition: {
                regexFilter: `^(https?://(?:[^/]*\\.)?(${escapedDomain})(?:/.*)?)$`,
                resourceTypes: ["main_frame"]
              }
            });
          }
        }
      }
    }

    const existingRules = await api.declarativeNetRequest.getDynamicRules();
    const existingIds = existingRules.map(r => r.id);

    await api.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: existingIds,
      addRules: rules
    });
    
    const logMsg = `Synced ${rules.length} active rules. globalEnabled=${isGlobalEnabled}.`;
    await api.storage.local.set({ debugLog: logMsg });
    console.log(`Farside Redirector: ${logMsg}`);
  } catch (error) {
    const errorMsg = `Error in syncRules: ${error.message}\nStack: ${error.stack}`;
    try {
      await api.storage.local.set({ debugLog: errorMsg });
    } catch (_) {}
    console.error("Farside Redirector: syncRules failed:", error);
  }
};

// Initialize config and handle migrations on install or startup
const initializeConfig = async () => {
  const api = typeof browser !== "undefined" ? browser : chrome;
  
  try {
    const response = await fetch(api.runtime.getURL("services.json"));
    const freshServices = await response.json();
    
    const data = await api.storage.local.get(["services", "globalEnabled"]);
    
    if (!data.services) {
      console.log("Farside Redirector: Initializing default configuration...");
      await api.storage.local.set({ services: freshServices, globalEnabled: true });
    } else {
      console.log("Farside Redirector: Checking for configuration updates and migrations...");
      const existingServices = data.services;
      const updatedServices = {};

      // 1. Add new services and update existing domains/metadata while keeping user toggles
      for (const [key, freshService] of Object.entries(freshServices)) {
        if (existingServices[key] !== undefined) {
          // Key exists: Keep the user's custom 'enabled' preference, but update the matching domains and display name
          updatedServices[key] = {
            ...freshService,
            enabled: existingServices[key].enabled
          };
        } else {
          // New key added in update: Use the default config
          updatedServices[key] = freshService;
        }
      }

      // Any services in existingServices that are not in freshServices are naturally omitted (retired)
      const payload = { services: updatedServices };
      if (data.globalEnabled === undefined) {
        payload.globalEnabled = true;
      }
      await api.storage.local.set(payload);
    }
    
    // Always sync active rules to declarativeNetRequest
    await syncRules();
  } catch (e) {
    console.error("Farside Redirector: Failed to initialize/migrate config:", e);
  }
};

const api = typeof browser !== "undefined" ? browser : chrome;

api.runtime.onInstalled.addListener(initializeConfig);
api.runtime.onStartup.addListener(initializeConfig);

// Listen for messages from popup to resync rules
api.runtime.onMessage.addListener((message) => {
  if (message.action === "syncRules") {
    syncRules();
  }
});

console.log("Farside Redirector: Background service worker loaded.");
