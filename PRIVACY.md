# Privacy Policy

**Farside Redirector** is built with privacy as its core principle. This document outlines how the extension handles your information.

## 1. No Data Collection
We do not collect, store, track, or transmit any personal data, browsing history, search queries, IP addresses, or telemetry. 

## 2. Completely Local Processing
All URL matching and redirection logic is executed entirely on your device. The extension utilizes the browser's native and secure `declarativeNetRequest` API to perform redirections. This extension does not read or intercept the content of the pages you visit.

## 3. Data Storage
The extension stores only configuration preferences (such as which services are enabled/disabled and your preferred UI sorting states) locally on your device using `browser.storage.local`. This data is never uploaded to any external server.

## 4. Third-Party Services
When a request matches an enabled service, the request is redirected to **farside.link** (e.g., `https://farside.link/nitter/...`), which then forwards the request to an active, public instance of a privacy-respecting frontend (e.g., Nitter, Invidious, Libreddit).
- **Farside.link**: Redirections are subject to the privacy practices of [farside.link](https://farside.link).
- **Alternative Frontends**: Once redirected, you are interacting with public alternative frontends operated by third-party volunteers. We recommend reviewing the privacy policies of those specific services/instances if you have concerns.

## 5. Extension Permissions
The extension requests the following permissions to function:
- **`declarativeNetRequest`**: Needed to modify network requests and redirect them to alternative frontends securely and performantly.
- **Host Permissions (`*://farside.link/*`, `...`)**: Required to intercept requests on target service domains (like `youtube.com` or `twitter.com`) and rewrite them to `farside.link`.

## 6. Changes to This Policy
This privacy policy may be updated. Any changes will be reflected by updating this file in the repository.
