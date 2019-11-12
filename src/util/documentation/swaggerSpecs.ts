import swaggerJsdoc from "swagger-jsdoc";

// http://www.acuriousanimal.com/2018/10/20/express-swagger-doc.html

const options = {
    apis: ["src/controllers/*.ts"],
    base: "/",
    swaggerDefinition: {
        // https://swagger.io/specification/#infoObject
        info: {
            title: "Plan your Day",
            version: "1.0.0",
        },
    },
};

export const specs = swaggerJsdoc(options);
