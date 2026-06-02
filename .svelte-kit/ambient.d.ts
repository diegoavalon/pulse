// this file is generated — do not edit it

/// <reference types="@sveltejs/kit" />

/**
 * This module provides access to environment variables that are injected _statically_ into your bundle at build time and are limited to _private_ access.
 *
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 *
 * Static environment variables are [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env` at build time and then statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 *
 * **_Private_ access:**
 *
 * - This module cannot be imported into client-side code
 * - This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured)
 *
 * For example, given the following build time environment:
 *
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://site.com
 * ```
 *
 * With the default `publicPrefix` and `privatePrefix`:
 *
 * ```ts
 * import { ENVIRONMENT, PUBLIC_BASE_URL } from '$env/static/private';
 *
 * console.log(ENVIRONMENT); // => "production"
 * console.log(PUBLIC_BASE_URL); // => throws error during build
 * ```
 *
 * The above values will be the same _even if_ different values for `ENVIRONMENT` or `PUBLIC_BASE_URL` are set at runtime, as they are statically replaced in your code with their build time values.
 */
declare module "$env/static/private" {
  export const VSCODE_CWD: string;
  export const REPLICATE_API_TOKEN: string;
  export const VSCODE_ESM_ENTRYPOINT: string;
  export const USER: string;
  export const VSCODE_NLS_CONFIG: string;
  export const VSCODE_WSL_EXT_LOCATION: string;
  export const VSCODE_HANDLES_UNCAUGHT_ERRORS: string;
  export const BUN_INSTALL: string;
  export const DEBUG: string;
  export const WT_PROFILE_ID: string;
  export const SHLVL: string;
  export const HOME: string;
  export const OLDPWD: string;
  export const LESS: string;
  export const GIT_CONFIG_COUNT: string;
  export const NVM_BIN: string;
  export const VSCODE_RECONNECTION_GRACE_TIME: string;
  export const VSCODE_IPC_HOOK_CLI: string;
  export const ZSH: string;
  export const LSCOLORS: string;
  export const NVM_INC: string;
  export const PAGER: string;
  export const HOMEBREW_PREFIX: string;
  export const COPILOT_OTEL_FILE_EXPORTER_PATH: string;
  export const DBUS_SESSION_BUS_ADDRESS: string;
  export const P9K_TTY: string;
  export const NO_COLOR: string;
  export const WSL_DISTRO_NAME: string;
  export const POSTHOG_API_KEY: string;
  export const NVM_DIR: string;
  export const WAYLAND_DISPLAY: string;
  export const INFOPATH: string;
  export const APPLICATION_INSIGHTS_NO_STATSBEAT: string;
  export const VSCODE_L10N_BUNDLE_LOCATION: string;
  export const LOGNAME: string;
  export const OTEL_INSTRUMENTATION_GENAI_CAPTURE_MESSAGE_CONTENT: string;
  export const PULSE_SERVER: string;
  export const WSL_INTEROP: string;
  export const NAME: string;
  export const _: string;
  export const VSCODE_HANDLES_SIGPIPE: string;
  export const _P9K_SSH_TTY: string;
  export const RUST_LOG: string;
  export const TERM: string;
  export const FIGMA_OAUTH_TOKEN: string;
  export const GIT_CONFIG_VALUE_0: string;
  export const PATH: string;
  export const HOMEBREW_CELLAR: string;
  export const XDG_RUNTIME_DIR: string;
  export const WT_SESSION: string;
  export const DISPLAY: string;
  export const LANG: string;
  export const NoDefaultCurrentDirectoryInExePath: string;
  export const LS_COLORS: string;
  export const COPILOT_OTEL_ENABLED: string;
  export const OXC_LOG: string;
  export const SHELL: string;
  export const GITHUB_PERSONAL_ACCESS_TOKEN: string;
  export const NODE_PATH: string;
  export const GIT_CONFIG_KEY_0: string;
  export const P9K_SSH: string;
  export const PWD: string;
  export const NVM_CD_FLAGS: string;
  export const _P9K_TTY: string;
  export const HOMEBREW_REPOSITORY: string;
  export const HOSTTYPE: string;
  export const WSL2_GUI_APPS_ENABLED: string;
  export const PNPM_HOME: string;
  export const WSLENV: string;
  export const COPILOT_OTEL_EXPORTER_TYPE: string;
  export const VP_TOOL_RECURSION: string;
  export const VP_VERSION: string;
  export const NODE_ENV: string;
}

/**
 * This module provides access to environment variables that are injected _statically_ into your bundle at build time and are _publicly_ accessible.
 *
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 *
 * Static environment variables are [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env` at build time and then statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 *
 * **_Public_ access:**
 *
 * - This module _can_ be imported into client-side code
 * - **Only** variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`) are included
 *
 * For example, given the following build time environment:
 *
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://site.com
 * ```
 *
 * With the default `publicPrefix` and `privatePrefix`:
 *
 * ```ts
 * import { ENVIRONMENT, PUBLIC_BASE_URL } from '$env/static/public';
 *
 * console.log(ENVIRONMENT); // => throws error during build
 * console.log(PUBLIC_BASE_URL); // => "http://site.com"
 * ```
 *
 * The above values will be the same _even if_ different values for `ENVIRONMENT` or `PUBLIC_BASE_URL` are set at runtime, as they are statically replaced in your code with their build time values.
 */
declare module "$env/static/public" {}

/**
 * This module provides access to environment variables set _dynamically_ at runtime and that are limited to _private_ access.
 *
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 *
 * Dynamic environment variables are defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/main/packages/adapter-node) (or running [`vite preview`](https://svelte.dev/docs/kit/cli)), this is equivalent to `process.env`.
 *
 * **_Private_ access:**
 *
 * - This module cannot be imported into client-side code
 * - This module includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured)
 *
 * > [!NOTE] In `dev`, `$env/dynamic` includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 *
 * > [!NOTE] To get correct types, environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * >
 * > ```env
 * > MY_FEATURE_FLAG=
 * > ```
 * >
 * > You can override `.env` values from the command line like so:
 * >
 * > ```sh
 * > MY_FEATURE_FLAG="enabled" npm run dev
 * > ```
 *
 * For example, given the following runtime environment:
 *
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://site.com
 * ```
 *
 * With the default `publicPrefix` and `privatePrefix`:
 *
 * ```ts
 * import { env } from '$env/dynamic/private';
 *
 * console.log(env.ENVIRONMENT); // => "production"
 * console.log(env.PUBLIC_BASE_URL); // => undefined
 * ```
 */
declare module "$env/dynamic/private" {
  export const env: {
    VSCODE_CWD: string;
    REPLICATE_API_TOKEN: string;
    VSCODE_ESM_ENTRYPOINT: string;
    USER: string;
    VSCODE_NLS_CONFIG: string;
    VSCODE_WSL_EXT_LOCATION: string;
    VSCODE_HANDLES_UNCAUGHT_ERRORS: string;
    BUN_INSTALL: string;
    DEBUG: string;
    WT_PROFILE_ID: string;
    SHLVL: string;
    HOME: string;
    OLDPWD: string;
    LESS: string;
    GIT_CONFIG_COUNT: string;
    NVM_BIN: string;
    VSCODE_RECONNECTION_GRACE_TIME: string;
    VSCODE_IPC_HOOK_CLI: string;
    ZSH: string;
    LSCOLORS: string;
    NVM_INC: string;
    PAGER: string;
    HOMEBREW_PREFIX: string;
    COPILOT_OTEL_FILE_EXPORTER_PATH: string;
    DBUS_SESSION_BUS_ADDRESS: string;
    P9K_TTY: string;
    NO_COLOR: string;
    WSL_DISTRO_NAME: string;
    POSTHOG_API_KEY: string;
    NVM_DIR: string;
    WAYLAND_DISPLAY: string;
    INFOPATH: string;
    APPLICATION_INSIGHTS_NO_STATSBEAT: string;
    VSCODE_L10N_BUNDLE_LOCATION: string;
    LOGNAME: string;
    OTEL_INSTRUMENTATION_GENAI_CAPTURE_MESSAGE_CONTENT: string;
    PULSE_SERVER: string;
    WSL_INTEROP: string;
    NAME: string;
    _: string;
    VSCODE_HANDLES_SIGPIPE: string;
    _P9K_SSH_TTY: string;
    RUST_LOG: string;
    TERM: string;
    FIGMA_OAUTH_TOKEN: string;
    GIT_CONFIG_VALUE_0: string;
    PATH: string;
    HOMEBREW_CELLAR: string;
    XDG_RUNTIME_DIR: string;
    WT_SESSION: string;
    DISPLAY: string;
    LANG: string;
    NoDefaultCurrentDirectoryInExePath: string;
    LS_COLORS: string;
    COPILOT_OTEL_ENABLED: string;
    OXC_LOG: string;
    SHELL: string;
    GITHUB_PERSONAL_ACCESS_TOKEN: string;
    NODE_PATH: string;
    GIT_CONFIG_KEY_0: string;
    P9K_SSH: string;
    PWD: string;
    NVM_CD_FLAGS: string;
    _P9K_TTY: string;
    HOMEBREW_REPOSITORY: string;
    HOSTTYPE: string;
    WSL2_GUI_APPS_ENABLED: string;
    PNPM_HOME: string;
    WSLENV: string;
    COPILOT_OTEL_EXPORTER_TYPE: string;
    VP_TOOL_RECURSION: string;
    VP_VERSION: string;
    NODE_ENV: string;
    [key: `PUBLIC_${string}`]: undefined;
    [key: `${string}`]: string | undefined;
  };
}

/**
 * This module provides access to environment variables set _dynamically_ at runtime and that are _publicly_ accessible.
 *
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 *
 * Dynamic environment variables are defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/main/packages/adapter-node) (or running [`vite preview`](https://svelte.dev/docs/kit/cli)), this is equivalent to `process.env`.
 *
 * **_Public_ access:**
 *
 * - This module _can_ be imported into client-side code
 * - **Only** variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`) are included
 *
 * > [!NOTE] In `dev`, `$env/dynamic` includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 *
 * > [!NOTE] To get correct types, environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * >
 * > ```env
 * > MY_FEATURE_FLAG=
 * > ```
 * >
 * > You can override `.env` values from the command line like so:
 * >
 * > ```sh
 * > MY_FEATURE_FLAG="enabled" npm run dev
 * > ```
 *
 * For example, given the following runtime environment:
 *
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://example.com
 * ```
 *
 * With the default `publicPrefix` and `privatePrefix`:
 *
 * ```ts
 * import { env } from '$env/dynamic/public';
 * console.log(env.ENVIRONMENT); // => undefined, not public
 * console.log(env.PUBLIC_BASE_URL); // => "http://example.com"
 * ```
 *
 * ```
 *
 * ```
 */
declare module "$env/dynamic/public" {
  export const env: {
    [key: `PUBLIC_${string}`]: string | undefined;
  };
}
