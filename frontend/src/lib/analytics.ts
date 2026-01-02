export type EventName =
  | 'screen_view'
  | 'search_exec'
  | 'detail_view'
  | 'fav_add'
  | 'fav_remove'
  | 'offline_banner_show'
  | 'error';

type Params = Record<string, unknown> | undefined;

/**
 * MVP計測ラッパー。実送信は行わず、開発時のみ console.debug に出力する。
 */
export const track = (event: EventName, params?: Params) => {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.debug('[track]', event, params);
  }
};
