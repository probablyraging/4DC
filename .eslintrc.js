module.exports = {
    "env": {
        "node": true,
        "commonjs": true,
        "es2021": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaVersion": 13
    },
    "rules": {
        "brace-style": [
            "error",
            "1tbs"
        ],
        "indent": [
            "error",
            4
        ],
        "linebreak-style": [
            "error",
            "windows"
        ],
        "semi": [
            "error",
            "always"
        ],
        "curly": [
            "error",
            "all"
        ],
        "no-unreachable": [
            "error"
        ],
        "no-unused-vars": [
            "error"
        ]
    }
};
