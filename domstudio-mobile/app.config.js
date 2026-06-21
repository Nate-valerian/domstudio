const app = require("./app.json");

const apiUrl =
  process.env.EXPO_PUBLIC_API_URL ||
  app.expo.extra?.apiUrl ||
  "http://localhost:8000";

module.exports = {
  expo: {
    ...app.expo,
    extra: {
      ...(app.expo.extra || {}),
      apiUrl,
    },
  },
};
