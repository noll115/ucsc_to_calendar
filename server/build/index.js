"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const finals_1 = __importDefault(require("./modules/finals"));
const courseURL = "https://pisa.ucsc.edu/class_search/index.php";
const keyDatesURL = "https://registrar.ucsc.edu/calendar/key-dates/index.html";
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        // let quarters = await GetQuarters();
        // let { num: quarterNum, year, keyDates } = quarters.spring;
        // let { instruction: { begins } } = keyDates
        // let courseToNums = await GetCourses(quarterNum, year);
        // let cal = ical({ domain: "ucsc-cal.com", name: "ucsc" });
        // let event = cal.createEvent({
        //     timezone:"America/Los_Angeles",
        //     start: startDate,
        //     summary: courseSelected.name,
        //     description: "",
        //     location: courseSelected.loc,
        //     end: endDate,
        //     repeating: {
        //         freq: "WEEKLY",
        //         exclude: keyDates.holidays,
        //         byDay: courseSelected.meets[0].days,
        //         until: ends
        //     },
        //     alarms:[],
        // });
        // console.log(cal.toJSON());
        // cal.saveSync("./cal.ics")
        yield finals_1.default.GetFinalDates();
    });
}
main();
//# sourceMappingURL=index.js.map