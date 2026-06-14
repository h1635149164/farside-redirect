<h1 align="center">
  <img src="https://github.com/h1635149164/farside-redirect/blob/dev/src/icons/icon.svg" width="172" height="172" alt="Farside Redirector Logo"><br>
  Farside Redirect
</h1>

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

## CI / Build Status
| Browser | Dev | RC | Release |
|:-------:|:-----------:|:---------:|:-------------------:|
| 🦊 Firefox | [![Firefox · dev lint](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/h1635149164/85e98da7045e2e6b4c3b9ee22ddf1834/raw/firefox-dev-lint.json&logo=firefox-browser&label=Firefox)](https://github.com/h1635149164/farside-redirect/actions/workflows/build-firefox.yml) | [![Firefox · rc lint](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/h1635149164/85e98da7045e2e6b4c3b9ee22ddf1834/raw/firefox-rc-lint.json&logo=firefox-browser&label=Firefox)](https://github.com/h1635149164/farside-redirect/actions/workflows/build-firefox.yml) | [![Firefox · release lint](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/h1635149164/85e98da7045e2e6b4c3b9ee22ddf1834/raw/firefox-release-lint.json&logo=firefox-browser&label=Firefox)](https://github.com/h1635149164/farside-redirect/actions/workflows/release.yml) |
| 🌐 Chrome | [![Chrome · dev lint](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/h1635149164/85e98da7045e2e6b4c3b9ee22ddf1834/raw/chrome-dev-lint.json&logo=googlechrome&label=Chrome)](https://github.com/h1635149164/farside-redirect/actions/workflows/build-chrome.yml) | [![Chrome · rc lint](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/h1635149164/85e98da7045e2e6b4c3b9ee22ddf1834/raw/chrome-rc-lint.json&logo=googlechrome&label=Chrome)](https://github.com/h1635149164/farside-redirect/actions/workflows/build-chrome.yml) | [![Chrome · release lint](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/h1635149164/85e98da7045e2e6b4c3b9ee22ddf1834/raw/chrome-release-lint.json&logo=googlechrome&label=Chrome)](https://github.com/h1635149164/farside-redirect/actions/workflows/build-chrome.yml) |

---


## Local Development & Testing

Since this extension targets local usage and development:

1. Clone or download the repository.
2. Open Firefox and navigate to `about:debugging`.
3. Click on **This Firefox**.
4. Click **Load Temporary Add-on...** and select `manifest.json` from the extension's folder.
5. The extension icon will appear in your toolbar.

## License

This project is licensed under the [GNU GPLv3 License](https://www.gnu.org/licenses/gpl-3.0.txt).
