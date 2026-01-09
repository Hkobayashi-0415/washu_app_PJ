module.exports = {
  ci: {
    collect: {
      startServerCommand: 'pnpm run preview -- --host 127.0.0.1 --port 4173',
      startServerReadyPattern: 'Local:',
      startServerReadyTimeout: 60000,
      url: ['http://localhost:4173/search'],
      numberOfRuns: 1,
      settings: {
        formFactor: 'mobile',
        screenEmulation: {
          mobile: true,
          width: 390,
          height: 844,
          deviceScaleFactor: 2,
          disabled: false,
        },
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.75 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'categories:pwa': 'off',
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: '../docs/lh',
      reportFilenamePattern: 'lhci-%%DATE%%-%%TIME%%.html',
      reportHtml: true,
    },
  },
};
