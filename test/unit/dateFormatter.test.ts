import { formatDate, formatDateTime, formatTime } from "../../src/lib/utils/dateFormatter";
import moment from "moment";

describe("lib/utils/dateFormatter Tests", () => {

    beforeAll(async () => {
        moment.locale("de");
    });

    // SGBUDF01
    it("check date time formatter!", async () => {
        const date = new Date(2019, 0, 1, 12, 0, 0);
        const formattedDate = formatDateTime(date);

        expect(formattedDate).toEqual("01.01.2019 12:00");
    });

    // SGBUDF02
    it("check date formatter!", async () => {
        const date = new Date(2019, 0, 1);
        const formattedDate = formatDate(date);

        expect(formattedDate).toEqual("01.01.2019");
    });

    // SGBUDF03
    it("check time formatter!", async () => {
        const date = new Date(2019, 0, 1, 12, 0, 0);
        const formattedDate = formatTime(date);

        expect(formattedDate).toEqual("12:00");
    });
});