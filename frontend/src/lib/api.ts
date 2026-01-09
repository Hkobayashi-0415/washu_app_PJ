import { z } from 'zod';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? window.location.origin;

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const rawSakeSummarySchema = z.object({
  id: z.number(),
  name: z.string(),
  brewery: z.string(),
  region: z.string(),
  tags: z.array(z.string()).nullish(),
  image_url: z.string().trim().min(1).optional().nullable(),
});

const rawSakeDetailSchema = z.object({
  id: z.number(),
  name: z.string(),
  brewery: z.string(),
  region: z.string(),
  rice: z.string().optional().nullable(),
  seimaibuai: z.number().optional().nullable(),
  nihonshudo: z.number().optional().nullable(),
  acid: z.number().optional().nullable(),
  alcohol: z.number().optional().nullable(),
  taste_tags: z.array(z.string()).optional().nullable(),
  description: z.string().optional().nullable(),
  image_url: z.string().trim().min(1).optional().nullable(),
});

const rawSearchResponseSchema = z.object({
  items: z.array(rawSakeSummarySchema),
  page: z.number(),
  per_page: z.number(),
  total: z.number(),
});

const regionsResponseSchema = z.object({
  regions: z.array(z.string()),
});

export type SakeSummary = {
  id: number;
  name: string;
  brewery: string;
  region: string;
  tags: string[];
  imageUrl?: string;
};

export type SakeSearchResponse = {
  items: SakeSummary[];
  page: number;
  perPage: number;
  total: number;
};

export type SakeDetail = {
  id: number;
  name: string;
  brewery: string;
  region: string;
  rice?: string;
  seimaibuai?: number;
  nihonshudo?: number;
  acid?: number;
  alcohol?: number;
  tasteTags: string[];
  description?: string;
  imageUrl?: string;
};

export type SakeSearchParams = {
  q?: string;
  region?: string;
  page?: number;
  perPage?: number;
};

type RequestOptions = {
  signal?: AbortSignal;
};

const mapSakeSummary = (raw: z.infer<typeof rawSakeSummarySchema>): SakeSummary => ({
  id: raw.id,
  name: raw.name,
  brewery: raw.brewery,
  region: raw.region,
  tags: raw.tags ?? [],
  imageUrl: raw.image_url ?? undefined,
});

const toOptionalValue = <T>(value: T | null | undefined): T | undefined =>
  value === null || value === undefined ? undefined : value;

const mapSakeDetail = (raw: z.infer<typeof rawSakeDetailSchema>): SakeDetail => ({
  id: raw.id,
  name: raw.name,
  brewery: raw.brewery,
  region: raw.region,
  rice: toOptionalValue(raw.rice),
  seimaibuai: toOptionalValue(raw.seimaibuai),
  nihonshudo: toOptionalValue(raw.nihonshudo),
  acid: toOptionalValue(raw.acid),
  alcohol: toOptionalValue(raw.alcohol),
  tasteTags: raw.taste_tags ?? [],
  description: toOptionalValue(raw.description),
  imageUrl: raw.image_url ?? undefined,
});

const buildUrl = (
  path: string,
  params: Record<string, string | number | undefined>,
) => {
  const base = API_BASE_URL.endsWith('/')
    ? API_BASE_URL.slice(0, -1)
    : API_BASE_URL;
  const url = new URL(path, `${base}/`);

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }
    url.searchParams.set(key, String(value));
  });

  return url;
};

const parseErrorDetail = (payload: unknown): string | undefined => {
  if (!payload || typeof payload !== 'object') {
    return undefined;
  }

  const detail = (payload as { detail?: unknown }).detail;
  if (!detail) {
    return undefined;
  }

  if (typeof detail === 'string') {
    return detail;
  }

  if (
    typeof detail === 'object' &&
    detail !== null &&
    'message' in detail &&
    typeof (detail as { message: unknown }).message === 'string'
  ) {
    return (detail as { message: string }).message;
  }

  return undefined;
};

const NETWORK_ERROR_MESSAGE = 'APIサーバーに接続できません。バックエンドが起動しているか確認してください。';

const requestJson = async <T>(
  path: string,
  params: Record<string, string | number | undefined>,
  fallbackMessage: string,
  { signal }: RequestOptions = {},
): Promise<T> => {
  let response: Response;
  try {
    response = await fetch(buildUrl(path, params), { signal });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new ApiError(NETWORK_ERROR_MESSAGE, 0);
    }
    throw error;
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    payload = undefined;
  }

  if (!response.ok) {
    const detail = parseErrorDetail(payload);
    throw new ApiError(detail ?? fallbackMessage, response.status);
  }

  if (payload === undefined) {
    throw new ApiError('レスポンスの解析に失敗しました。', response.status);
  }

  return payload as T;
};

export const getSakeSearch = async (
  params: SakeSearchParams,
  options?: RequestOptions,
): Promise<SakeSearchResponse> => {
  const payload = await requestJson<unknown>(
    '/api/v1/sake/search',
    {
      q: params.q,
      region: params.region,
      page: params.page ?? 1,
      per_page: params.perPage ?? 20,
    },
    '検索結果の取得に失敗しました。',
    options,
  );

  const parsed = rawSearchResponseSchema.parse(payload);

  return {
    items: parsed.items.map(mapSakeSummary),
    page: parsed.page,
    perPage: parsed.per_page,
    total: parsed.total,
  };
};

export const getSakeDetail = async (
  id: number,
  options?: RequestOptions,
): Promise<SakeDetail> => {
  const payload = await requestJson<unknown>(
    `/api/v1/sake/${id}`,
    {},
    '銘柄詳細の取得に失敗しました。',
    options,
  );
  const parsed = rawSakeDetailSchema.parse(payload);
  return mapSakeDetail(parsed);
};

export const getRegions = async (options?: RequestOptions): Promise<string[]> => {
  const payload = await requestJson<unknown>(
    '/api/v1/meta/regions',
    {},
    '地域リストの取得に失敗しました。',
    options,
  );
  const parsed = regionsResponseSchema.parse(payload);
  return parsed.regions;
};
