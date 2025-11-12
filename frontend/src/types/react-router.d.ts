import 'react-router';

declare module 'react-router' {
  interface FutureConfig {
    v7_startTransition?: boolean;
  }
}
