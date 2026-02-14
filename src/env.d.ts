/// <reference types="vite/client" />

interface NodeJS {
  readonly process: {
    readonly env: ProcessEnv;
  };
}

interface ProcessEnv {
  readonly NEXT_PUBLIC_API_URL: string;
  readonly NEXT_PUBLIC_BETTER_AUTH_URL: string;
  readonly NEXT_PUBLIC_OWNER_EMAIL: string;
  readonly NEXT_PUBLIC_DEV_BYPASS_AUTH: string;
}
