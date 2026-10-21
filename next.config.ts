import { withSentryConfig } from '@sentry/nextjs';
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Allow access to remote image placeholder.
  images: {
    remotePatterns: [
      {
        // An admin can set any image URL for a gym from the admin panel, so
        // the optimizer has to be willing to fetch whatever they entered.
        // Restricting this to a fixed list would make the panel's field
        // useless for every host that is not on it.
        protocol: 'https',
        hostname: '**',
        port: '',
        pathname: '/**', // This allows any path under the hostname
      },
    ],
  },
  // `output: 'standalone'` is left off on purpose. Liara (and every other
  // host that runs `npm start`) starts the app with `next start`, which does
  // not work with the standalone output - Next.js prints a warning and the
  // static files are not served the way they should be. Turn it back on if
  // the app is ever built into a Docker image.
  transpilePackages: ['motion'],
  webpack: (config, {dev}) => {
    // HMR is disabled in AI Studio via DISABLE_HMR env var.
    // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
    if (dev && process.env.DISABLE_HMR === 'true') {
      config.watchOptions = {
        ignored: /.*/,
      };
    }
    return config;
  },
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  // Suppresses source map uploading logs during build
  silent: true,
  org: "placeholder-org", // Must be set to pass validation, though uploading is disabled
  project: "placeholder-project",

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  // Hides source maps from generated client bundles
  sourcemaps: {
    disable: true
  },

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  webpack: {
    treeshake: {
      removeDebugLogging: true
    },
    automaticVercelMonitors: false,
  }
});
