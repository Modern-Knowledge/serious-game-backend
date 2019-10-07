import swaggerJsdoc from "swagger-jsdoc";

// http://www.acuriousanimal.com/2018/10/20/express-swagger-doc.html

const options = {
    swaggerDefinition: {
        // https://swagger.io/specification/#infoObject
        info: {
            title: "Plan your Day",
            version: "1.0.0",
        },
    },
    apis: ["src/controllers/*.ts"],
    base: "/"
};

export const specs = swaggerJsdoc(options);
