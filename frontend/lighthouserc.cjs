module.exports = {
  ci: {
    collect: {
      startServerCommand: 'pnpm run preview -- --host 127.0.0.1 --port 4173',
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
        onlyCategories: [
          'performance',
          'accessibility',
          'best-practices',
          'seo',
          'pwa',
        ],
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.75 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'categories:pwa': ['error', { minScore: 1 }],
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
