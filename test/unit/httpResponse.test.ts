import {
    HttpResponse,
    HttpResponseMessage,
    HttpResponseMessageSeverity,
    HttpResponseStatus
} from "../../src/lib/utils/http/HttpResponse";

describe("lib/utils/http/HttpResponse Tests", () => {

    // SGBUHP01
    it("check deserialization of http response", async () => {
        const data = { data: "test", data1: "test2" };
        const message = [
            new HttpResponseMessage(HttpResponseMessageSeverity.DANGER, "Testmessage"),
            new HttpResponseMessage(HttpResponseMessageSeverity.SUCCESS, "Testmessage")
        ];

        const httpResponse = new HttpResponse(
            HttpResponseStatus.SUCCESS,
            data,
            message
        );

        const deserializeHttpResponse = new HttpResponse();
        deserializeHttpResponse.deserialize(httpResponse);

        expect(httpResponse).toEqual(deserializeHttpResponse); // check if token changed
    });
});
