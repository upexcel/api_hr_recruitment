module.exports = {
    "parser": "babel-eslint",
    "env": {
        "browser": true,
        // "commonjs": true,
        "es6": true,
        "node": true,
        "jquery": true
    },
    "extends": "eslint:recommended",

    "parserOptions": {
        "ecmaFeatures": {
            "jsx": true
        },
        "sourceType": "module"
    },
    "ecmaFeatures": {
        "arrowFunctions": true
    },
    "rules": {
        "no-tabs": 0,
        "indent": [
            "error",
            "tab"
        ],
        "no-console": 0,
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "double"
        ],
        "semi": [
            "error",
            "always"
        ],
    }
};
