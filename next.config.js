/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: function(config) {
      config.module.rules.push({
        test: /\.md$/,
        use: 'raw-loader',
      })
      return config
    },
    env: {
        siteTitle: 'My Trip Hokkaido',
    },
    trailingSlash: true,
    experimental: {
        appDir: true,
    },
};
  
module.exports = nextConfig;