module.exports = {
    "env": {
        "browser": true,
        "es6": true,
        "node": true
    },
    "extends":[ 
        "eslint:recommended",
        "plugin:react/recommended"
    ],
    "parserOptions": {
        "ecmaFeatures": {
            "experimentalObjectRestSpread": true,
            "jsx": true
        },
        "sourceType": "module"
    },

    "settings": {
        "react": {
          "createClass": "createReactClass",
          "pragma": "React",  
          "version": "15.0", 
          "flowVersion": "0.53" 
        },
        "propWrapperFunctions": [ "forbidExtraProps" ] 
    },
    "rules": {
        "no-console": 0,
        "indent": [
            2,
            2
        ],
        "quotes": [
            2,
            "single"
        ],
        "semi": [
            2,
            "always"
        ]
    }
};