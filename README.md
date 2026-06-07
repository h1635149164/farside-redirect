# Farside Redirector

A privacy-focused Firefox Web Extension (Manifest V3) that automatically intercepts and redirects requests for popular web services to their corresponding privacy-friendly frontend alternatives via the **farside.link** global redirector.

## Key Features

- **Network-Level Interception**: Utilizes Firefox's Manifest V3 `declarativeNetRequest` API to redirect requests *before* the browser resolves DNS or initiates a connection to the target site. This ensures zero IP or query leaks to privacy-invasive platforms.
- **Native Extension Control**: Provides a clean, lightweight popup interface (inspired by Firefox's system style and uBlock Origin) to enable/disable redirections on a per-service basis.
- **Subdomain Wildcard Support**: Automatically matches subdomains (e.g., `www.genius.com`, `amp.genius.com`) for configured services.
- **Dynamic Configuration Sync**: Toggling a service instantly updates the active network routing rules in the background.

## Supported Services

The extension supports modular expansion. Supported services include:

- **Genius** &rarr; Dumb
- **Instagram** &rarr; Proxigram (default: off)
- **Twitter / X** &rarr; Nitter
- **YouTube** &rarr; Invidious / Piped
- **Reddit** &rarr; Libreddit / Teddit
- **Medium** &rarr; Scribe
- **Wikipedia** &rarr; WikiLess
- **IMDb** &rarr; Libremdb

*For the exact matching patterns and default states, see `services.json`.*

## How it Works

1. The registry of services is read from `services.json`.
2. On initial installation, the active state for each service is written to `browser.storage.local`.
3. The background service worker compiles the enabled domains into `declarativeNetRequest` dynamic rules.
4. When you navigate to a matching domain (e.g. typing `genius.com` in the address bar), the request is intercepted locally and redirected to `farside.link/https://genius.com/...` which then delegates you to an active public instance.

## Local Development & Testing

Since this extension targets local usage and development:

1. Clone or download the repository.
2. Open Firefox and navigate to `about:debugging`.
3. Click on **This Firefox**.
4. Click **Load Temporary Add-on...** and select `manifest.json` from the extension's folder.
5. The extension icon will appear in your toolbar.

## License

This project is licensed under the [GNU GPLv3 License](https://www.gnu.org/licenses/gpl-3.0.txt).
