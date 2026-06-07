/**
 * Farside Redirector - Background Service Worker
 *
 * Implements rule synchronization with browser.declarativeNetRequest
 * when the configuration in browser.storage.local changes.
 */

const syncRules = async () => {
  // Use browser API (Firefox), fallback to chrome API if needed
  const api = typeof browser !== "undefined" ? browser : chrome;
  
  const { services } = await api.storage.local.get("services");
  if (!services) return;

  const rules = [];
  let idCounter = 1;

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

  const existingRules = await api.declarativeNetRequest.getDynamicRules();
  const existingIds = existingRules.map(r => r.id);

  await api.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: existingIds,
    addRules: rules
  });
  console.log(`Farside Redirector: Synced ${rules.length} active rules.`);
};

// Initialize config on install or startup
const initializeConfig = async () => {
  const api = typeof browser !== "undefined" ? browser : chrome;
  const data = await api.storage.local.get("services");
  
  if (!data.services) {
    console.log("Farside Redirector: Initializing default configuration...");
    try {
      const response = await fetch(api.runtime.getURL("services.json"));
      const defaultServices = await response.json();
      await api.storage.local.set({ services: defaultServices });
      await syncRules();
    } catch (e) {
      console.error("Failed to load services.json", e);
    }
  } else {
    // Sync rules just to be sure they match storage on startup
    await syncRules();
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
