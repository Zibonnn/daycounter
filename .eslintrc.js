module.exports = {
  "env": {
    "browser": true
  },
  "globals": {
    "chrome": true,
    "moment": true,
    "Pikaday": true,
    "Sortable": true
  },
  "extends": ["eslint:recommended"],
  "rules": {
    "indent": ["error", 4],
    "linebreak-style": ["error","unix"],
    "quotes": ["error","single"],
    "semi": ["error","always"],
    "no-console": ["warn", { "allow": ["info", "error"] }]
  }
};
