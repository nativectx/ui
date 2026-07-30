// Used only by Jest (via jest-expo's babel-jest transform). The published
// package is compiled by tsc, not Babel — see tsconfig.build.json.
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
