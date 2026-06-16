<h1 align="center">
  <img src="https://github.com/h1635149164/farside-redirect/blob/dev/src/icons/icon.svg" width="172" height="172" alt="Farside Redirector Logo"><br>
  Farside Redirect
</h1>

A privacy-focused Firefox Web Extension (Manifest V3) that automatically intercepts and redirects requests for popular web services to their corresponding privacy-friendly frontend alternatives via the **farside.link** global redirector.

<p align="center">
<a href="https://addons.mozilla.org/en-US/firefox/addon/farside-redirector/">
<img src="https://blog.mozilla.org/addons/files/2015/11/get-the-addon.png" width="172" height="60">
</a>
</p>

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

## CI / Build Status
<div align="center">

| Dev | RC | Release |
|:---:|:---:|:---:|
| [![Firefox · dev lint](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/h1635149164/85e98da7045e2e6b4c3b9ee22ddf1834/raw/firefox-dev-lint.json&logo=firefox-browser)](https://github.com/h1635149164/farside-redirect/actions/workflows/build.yaml)<br>[![Chrome · dev lint](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/h1635149164/85e98da7045e2e6b4c3b9ee22ddf1834/raw/chrome-dev-lint.json&logo=googlechrome)](https://github.com/h1635149164/farside-redirect/actions/workflows/build.yaml) | [![Firefox · rc lint](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/h1635149164/85e98da7045e2e6b4c3b9ee22ddf1834/raw/firefox-rc-lint.json&logo=firefox-browser)](https://github.com/h1635149164/farside-redirect/actions/workflows/build.yaml)<br>[![Chrome · rc lint](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/h1635149164/85e98da7045e2e6b4c3b9ee22ddf1834/raw/chrome-rc-lint.json&logo=googlechrome)](https://github.com/h1635149164/farside-redirect/actions/workflows/build.yaml) | [![Firefox · release lint](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/h1635149164/85e98da7045e2e6b4c3b9ee22ddf1834/raw/firefox-release-lint.json&logo=firefox-browser)](https://github.com/h1635149164/farside-redirect/actions/workflows/release.yml)<br>[![Chrome · release lint](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/h1635149164/85e98da7045e2e6b4c3b9ee22ddf1834/raw/chrome-release-lint.json&logo=googlechrome)](https://github.com/h1635149164/farside-redirect/actions/workflows/build.yaml) |

</div>

---


## Local Development & Testing

> Recommended 
> 1. Set up ![act](https://github.com/nektos/act) (if on windows, set up WSL, and then `docker` in some linux distro, you might have an easier time running the whole thing than having to run ubuntu docker images under windows docker, `FedoraLinux-44` works just fine for me in WSL)
> 2. Clone the repo `git clone https://github.com/h1635149164/farside-redirect.git`
> 3. Run `act -j build-firefox --artifact-server-path ./artifact` or `act -j build-chrome --artifact-server-path ./artifact` depending on the target platform
> 4. Retrieve the build from the artifacts folder structure.

Alternatively you can use the `build.ps1` and `build.sh` scripts from the `scripts/` folder.  

## Privacy Policy

This extension is built with privacy in mind:
- **No Data Collection**: It does not collect, track, or transmit any user data, browsing history, or telemetry.
- **Local Execution**: All redirection logic is computed locally on your device via the native browser `declarativeNetRequest` API.
- **No Ads or Tracking**: No third-party trackers or ads are integrated.

For full details, read the [Privacy Policy](PRIVACY.md).

## License

This project is licensed under the [GNU GPLv3 License](https://www.gnu.org/licenses/gpl-3.0.txt).

