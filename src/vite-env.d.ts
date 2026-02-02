/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonlyVITE_API_URL: string
  readonlyVITE_BETTER_AUTH_URL: string
  readonlyVITE_OWNER_EMAIL: string
}

interface ImportMeta {
  readonlyenv: ImportMetaEnv
}
