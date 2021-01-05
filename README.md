# Imagus (Community Edition)

This repository is a "Mirror" of the [official Imagus source hosted on Google Drive](https://drive.google.com/drive/folders/0Bx8fnUCX4W2IUTNPT0s2eUFDQms).

This `community` branch is a [minor] fork of Imagus. It applies the following patches:

* [Remove the "update_url"](https://github.com/Zren/chrome-extension-imagus/commit/3974d88844ce044c0162e67247ac173f6cd488c9) so it doesn't auto update.
* Load the unminified `*.js` + `*.html` files instead of the minified ones for easier development.
* [Ignore "Local Extension Settings" folder](https://github.com/Zren/chrome-extension-imagus/commit/7ed81835b490fa0997a8accea95a442348e19cee) which is created when loaded as an unpacked developer extension.
* Add null check ([Pull Request #2](https://github.com/Zren/chrome-extension-imagus/pull/2))
* Compare the `master` with the `community` branch to see most changes:  
  https://github.com/Zren/chrome-extension-imagus/compare/master...community

Please note that the primary purpose of this repository is to audit the code. While I will merge pull requests, I won't be actively developing the extension / updating the sieves.

See README.txt for the original readme, including build/minifying instructions.


## Auditing

difference-to-chrome-store.diff contains the differences between what is in src
and what is actually published on the chrome store (extracted from the .crx).

## Updating the sieve

To just update the sieve, which is what describes how to extract images from
various sources, run the `update_sieve.sh` shell script.

If the version info in the sieve isn't up to date for some reason (look at the
dates in the Drive linked above), use `update_sieve.sh --force`.
