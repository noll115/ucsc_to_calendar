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
const cheerio_1 = __importDefault(require("cheerio"));
const axios_1 = __importDefault(require("axios"));
const ical_generator_1 = __importDefault(require("ical-generator"));
const fs_1 = require("fs");
const keyDatesURL = "https://registrar.ucsc.edu/calendar/key-dates/index.html";
const courseUrl = "https://pisa.ucsc.edu/class_search/index.php";
function translateDaysToIcal(daysStr) {
    const possibilities = ["M", "Tu", "W", "Th", "F", "Sa"];
    const iCalDates = ["mo", "tu", "we", "th", "fr", "sa", "su"];
    let days = [];
    possibilities.forEach((day, i) => {
        if (daysStr.includes(day))
            days.push(iCalDates[i]);
    });
    return days;
}
function ObtainLabData(quarterNum, classNum) {
    return __awaiter(this, void 0, void 0, function* () {
        let labsAvailable = { type: '' };
        let query = {
            "action": "detail",
            "class_data[:STRM]": quarterNum.toString(),
            "class_data[:CLASS_NBR]": classNum.toString()
        };
        let { data: html } = yield axios_1.default({
            method: "POST",
            url: courseUrl,
            data: new URLSearchParams(query)
        });
        let $ = cheerio_1.default.load(html);
        let [title, labPanel] = $("div.panel.panel-default.row").last().children().toArray();
        let labs = $(labPanel).children();
        if ($(title).text().includes("Sections or Labs")) {
            let labTitleRegex = /#(\d+) (\w+) (\w+)/;
            $(labs).each((i, lab) => {
                let labInfo = $(lab).children().toArray();
                let [days, time] = $(labInfo[1]).text().split(" ");
                if (days.includes("Cancelled"))
                    return true;
                let [, labNum, type, section] = $(labInfo[0]).text().match(labTitleRegex);
                let [, location] = $(labInfo[3]).text().split(": ");
                labsAvailable.type = labsAvailable.type || type;
                let labDetail = {
                    num: parseInt(labNum),
                    sect: section,
                    meet: {
                        days: translateDaysToIcal(days),
                        time
                    },
                    loc: location
                };
                labsAvailable[labDetail.num] = labDetail;
            });
        }
        return labsAvailable;
    });
}
function GetClasses(quarterNum) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            "action": "results",
            "binds[:term]": quarterNum.toString(),
            "binds[:reg_status]": "all",
            "binds[:subject]": "",
            "binds[:catalog_nbr_op]": "=",
            "binds[:catalog_nbr]": "",
            "binds[:title]": "",
            "binds[:instr_name_op]": "=",
            "binds[:instructor]": "",
            "binds[:ge]": "",
            "binds[:crse_units_op]": "=",
            "binds[:crse_units_from]": "",
            "binds[:crse_units_to]": "",
            "binds[:crse_units_exact]": "",
            "binds[:days]": "",
            "binds[:times]": "",
            "binds[:acad_career]": "",
            "rec_start": "0",
            "rec_dur": "9999"
        };
        const data = new URLSearchParams(query);
        let { data: html } = yield axios_1.default({
            method: "POST",
            url: courseUrl,
            data
        });
        let $ = cheerio_1.default.load(html);
        let courses = {};
        $("[id^='rowpanel']").each((i, elem) => __awaiter(this, void 0, void 0, function* () {
            let classInfo = $("div.panel-body>div.row div:nth-child(3)", elem);
            let classTimeInfo = $("div:nth-child(2)", classInfo).text();
            if (classTimeInfo.includes("Cancelled")) {
                return true;
            }
            let classLocStr = $("div:nth-child(1)", classInfo).text();
            let courseNum = parseInt($("[id^='class_nbr_']", elem).text());
            let courseDetails = {
                name: $("[id^='class_id_']", elem).text().replace(/\u00A0+/, ' '),
                num: courseNum,
                meets: [],
                loc: classLocStr.substr(classLocStr.lastIndexOf(":") + 2),
                labs: null
            };
            if (classTimeInfo.includes("TBA")) {
                courseDetails.meets.push({ days: ["TBA"], time: "TBA" });
            }
            else {
                let str = classTimeInfo.substr(classTimeInfo.indexOf(":") + 2).trim().replace(/\s{2,}/i, " ").split(" ");
                for (let i = 0; i < str.length; i += 2) {
                    let meeting = {
                        days: translateDaysToIcal(str[i]),
                        time: str[i + 1]
                    };
                    courseDetails.meets.push(meeting);
                }
            }
            courses[courseDetails.num] = courseDetails;
        }));
        return courses;
    });
}
function ParseDates(days, year) {
    let result = [];
    const inDateFormat = new RegExp(/[A-Z]+ \d+/i);
    const isNum = new RegExp(/^\d+$/);
    days.forEach((day, i) => {
        // if ["December 09-13"]
        if (day.includes("–")) {
            let [month, dates] = day.split(" ");
            let [from, to] = dates.split("–").map(num => Number(num));
            for (let i = from; i < to; i++) {
                result.push(new Date(`${month} ${i} ${year}`));
            }
        }
        // if ["December 09","3","4"]
        else if (inDateFormat.test(day) && isNum.test(days[i + 1])) {
            let [month, dateNum] = day.split(" ");
            result.push(new Date(`${month} ${dateNum} ${year}`));
            let index = i + 1;
            let currStr = days[index];
            while (isNum.test(currStr)) {
                result.push(new Date(`${month} ${currStr} ${year}`));
                currStr = days[++index];
            }
        }
        else if (inDateFormat.test(day)) {
            result.push(new Date(`${day} ${year}`));
        }
    });
    return result;
}
function ObtainCurrentQuarters() {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        let { data: coursePageHTML } = yield axios_1.default({
            method: "GET",
            url: courseUrl
        });
        let page = cheerio_1.default.load(coursePageHTML);
        let quarters = {};
        for (let i = 1; i < 3; i++) {
            let quarterElem = page(`#term_dropdown>option:nth-child(${i})`);
            let [year, season,] = quarterElem.text().split(" ");
            let current = ((_a = quarterElem.attr("selected")) === null || _a === void 0 ? void 0 : _a.valueOf()) !== undefined;
            let quarter = {
                year: parseInt(year),
                num: parseInt(quarterElem.attr("value")),
                season: season.toLowerCase(),
                current,
                keyDates: null
            };
            quarters[quarter.season] = quarter;
        }
        return quarters;
    });
}
function SetKeyDates(currentQuarters) {
    return __awaiter(this, void 0, void 0, function* () {
        let { data: keyDatesHTML } = yield axios_1.default({
            method: "GET",
            url: keyDatesURL
        });
        let $ = cheerio_1.default.load(keyDatesHTML, {
            decodeEntities: false
        });
        let quarterStrRegex = new RegExp(`([A-Z]+) [A-Z]+ \\d+`, "i");
        let trSelect = $("#main tbody>tr").toArray();
        for (let i = 0; i < trSelect.length; i++) {
            let elemStr = $(trSelect[i]).text();
            let tokens = quarterStrRegex.exec(elemStr);
            if (tokens) {
                let season = tokens[1].toLowerCase();
                if (season in currentQuarters) {
                    let quarter = currentQuarters[season];
                    let keyDates = {
                        finals: [],
                        holidays: [],
                        instruction: { begins: null, ends: null },
                        quarter: { begins: null, ends: null }
                    };
                    let lastElemIndex = i + 7;
                    for (i += 1; i < Math.min(lastElemIndex, trSelect.length); i++) {
                        let node = $(trSelect[i]);
                        let title = node.children("td:nth-child(1)").text().trim().split(" ");
                        let dates = node.children("td:nth-child(2)").html().match("<p>(.+)<br>")[1].trim().split(", ");
                        let parsedDates = ParseDates(dates, quarter.year);
                        if (title.length == 1) {
                            keyDates.holidays = parsedDates;
                        }
                        else {
                            if (title.includes("Final")) {
                                keyDates.finals = parsedDates;
                            }
                            else {
                                keyDates[title[0].toLowerCase()][title[1].toLowerCase()] = parsedDates;
                            }
                        }
                    }
                    quarter.keyDates = keyDates;
                }
            }
        }
    });
}
function GetQuarters() {
    return __awaiter(this, void 0, void 0, function* () {
        let currentQuarters = yield ObtainCurrentQuarters();
        yield SetKeyDates(currentQuarters);
        return currentQuarters;
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        let quarters = yield GetQuarters();
        let classes = JSON.parse(yield fs_1.promises.readFile("./data/courses.json", { encoding: "utf-8" }));
        console.log(classes);
        let { keyDates } = quarters.spring;
        let cal = ical_generator_1.default({ domain: "ucsc-cal.com", name: "ucsc" });
        let event = cal.createEvent({
            start: keyDates.instruction.begins,
            summary: "YES",
            location: "house",
            end: keyDates.instruction.ends
        });
        event.repeating({
            freq: "WEEKLY",
            exclude: keyDates.holidays,
        });
    });
}
main();
//# sourceMappingURL=index.js.map