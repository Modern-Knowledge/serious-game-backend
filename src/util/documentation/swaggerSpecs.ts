import swaggerJsdoc from "swagger-jsdoc";

const options = {
    swaggerDefinition: {
        // Like the one described here: https://swagger.io/specification/#infoObject
        info: {
            swagger: "2.0",
            title: "Plan your Day",
            version: "1.0.0",
            description: "",
        },
    },
    // List of files to be processes. You can also set globs './routes/*.js'
    apis: ["../../controllers/*.js"],
};

export const specs = swaggerJsdoc(options);
