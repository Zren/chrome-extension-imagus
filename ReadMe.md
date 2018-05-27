# Imagus (Community Edition)

This repository is a "Mirror" of the [official Imagus source hosted on Google Drive](https://drive.google.com/drive/folders/0Bx8fnUCX4W2IaFVqdzRsNm9feG8).

This `community` branch is a [minor] fork of Imagus. It applies the following patches:

* [Remove the "update_url"](https://github.com/Zren/chrome-extension-imagus/commit/3974d88844ce044c0162e67247ac173f6cd488c9) so it doesn't auto update.
* [Load the unminified `*.js` files instead of the minified ones](https://github.com/Zren/chrome-extension-imagus/commit/63f6de47d9e771eeef2d08dec817a05670e4defb) for easier development.
* [Ignore "Local Extension Settings" folder](https://github.com/Zren/chrome-extension-imagus/commit/7ed81835b490fa0997a8accea95a442348e19cee) which is created when loaded as an unpacked developer extension.
* [Add null check](https://github.com/Zren/chrome-extension-imagus/commit/cb2e083acd1600dfe2f4446b54c3fca5aba1af9b).

Please note that the primary purpose of this repository is to audit the code. While I will merge pull requests, I won't be actively developing the extension / updating the sieves.
