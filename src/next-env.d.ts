/// <reference types="next" />
/// <reference types="next/image-types/global" />

interface ImportMetaEnv {
  readonly NEXT_PUBLIC_API_URL: string;
  readonly NEXT_PUBLIC_BETTER_AUTH_URL: string;
  readonly NEXT_PUBLIC_OWNER_EMAIL: string;
  readonly NEXT_PUBLIC_DEV_BYPASS_AUTH: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
