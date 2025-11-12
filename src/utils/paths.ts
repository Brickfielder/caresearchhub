interface ImportMetaWithEnv {
  env?: {
    BASE_URL?: string;
  };
}

const getBaseUrl = () => {
  const envBase =
    typeof process !== 'undefined' ? (process.env.ASTRO_BASE ?? process.env.BASE_URL) : undefined;
  const fallback = envBase ?? '/';
  let meta: ImportMetaWithEnv | undefined;
  if (typeof import.meta !== 'undefined') {
    meta = import.meta as unknown as ImportMetaWithEnv;
  }
  const baseHref = meta?.env?.BASE_URL ?? fallback;
  let normalized = baseHref;
  if (normalized === '/') {
    normalized = '/';
  } else {
    normalized = `/${normalized.replace(/^\/+/, '').replace(/\/+$/, '')}/`;
  }
  return new URL(normalized, 'https://example.com');
};

export const resolveWithBase = (path: string): string => {
  const baseUrl = getBaseUrl();
  if (path === '/') {
    return new URL('.', baseUrl).pathname;
  }
  const normalized = path.replace(/^\//, '');
  return new URL(normalized, baseUrl).pathname;
};
