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
const course_data_1 = require("./models/course-data");
const keyDatesURL = "https://registrar.ucsc.edu/calendar/key-dates/index.html";
const courseURL = "https://pisa.ucsc.edu/class_search/index.php";
const finalURL = "https://registrar.ucsc.edu/soc/final-examinations.html";
function UCSCToIcalDays(daysStr) {
    let days = [];
    course_data_1.UCSCDates.forEach((day, i) => {
        if (daysStr.includes(day))
            days.push(course_data_1.iCalDates[i]);
    });
    return days;
}
function ObtainLabs($, labPanel, keyDates) {
    let labsAvailable = { type: '' };
    let labs = $(labPanel).children();
    let labTitleRegex = /#(\d+) (\w+) (\w+)/;
    $(labs).each((i, lab) => {
        let labDetail = null;
        let labInfo = $(lab).children().toArray();
        let [days, timeSlot] = $(labInfo[1]).text().split(" ");
        if (days.includes("Cancelled"))
            return true;
        let [, labNum, type, section] = $(labInfo[0]).text().match(labTitleRegex);
        if (days.includes("TBA")) {
            labDetail = {
                num: parseInt(labNum),
                sect: section,
                meet: course_data_1.TBA
            };
        }
        else {
            let meetingDays = UCSCToIcalDays(days);
            let [, location] = $(labInfo[3]).text().split(": ");
            labsAvailable.type = labsAvailable.type || type;
            let [startTime, endTime] = GetFirstMeeting(keyDates, timeSlot, meetingDays[0]);
            labDetail = {
                num: parseInt(labNum),
                sect: section,
                meet: {
                    days: meetingDays,
                    start: startTime,
                    end: endTime,
                    loc: location
                },
            };
        }
        labsAvailable[labDetail.num] = labDetail;
    });
    return labsAvailable;
}
function LocalTo24Hrs(local) {
    let timeRegex = new RegExp(/(\d{2}):(\d{2})(PM|AM)/);
    let [, hours, minutes, period] = timeRegex.exec(local);
    if (period === "PM") {
        let convHrs = parseInt(hours) + 12;
        return `${convHrs}:${minutes}`;
    }
    return `${hours}:${minutes}`;
}
function GetFirstMeeting({ instruction }, timeSlot, firstMeetingDay) {
    let dayChosen = course_data_1.iCalDates.indexOf(firstMeetingDay);
    let [startTimeSlot, endTimeSlot] = timeSlot.split("-").map(time => LocalTo24Hrs(time));
    let [startHr, startMin] = startTimeSlot.split(":").map(str => parseInt(str));
    let [endHr, endMin] = endTimeSlot.split(":").map(str => parseInt(str));
    // day is in range 0 Sunday to 6 Saturday
    let meetingDate = null;
    for (let i = 0; i < 8; i++) {
        let newDay = instruction.begins.getDay() + i;
        if (newDay % 7 == dayChosen) {
            meetingDate = new Date(instruction.begins.getFullYear(), instruction.begins.getMonth(), instruction.begins.getDate() + i);
            break;
        }
    }
    return [
        new Date(meetingDate.getFullYear(), meetingDate.getMonth(), meetingDate.getDate(), startHr, startMin),
        new Date(meetingDate.getFullYear(), meetingDate.getMonth(), meetingDate.getDate(), endHr, endMin)
    ];
}
function ObtainCourseMeetings(meetingPanel, $, keyDates) {
    let trElems = $("tr", meetingPanel).toArray();
    let meets = [];
    for (let i = 1; i < trElems.length; i++) {
        const tr = trElems[i];
        let [time, loc, instr, meetingDates] = $("td", tr).toArray().map(el => $(el).text());
        let [days, timeSlot] = time.split(" ");
        let meetingDays = UCSCToIcalDays(days);
        let [startTime, endTime] = GetFirstMeeting(keyDates, timeSlot, meetingDays[0]);
        meets.push({
            days: meetingDays,
            start: startTime,
            end: endTime,
            loc
        });
    }
    return meets;
}
function GetCourses(quarterNum, year) {
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
            url: courseURL,
            data
        });
        let $ = cheerio_1.default.load(html);
        let courseNums = [];
        let courseToNums = {};
        $("[id^='rowpanel_']").each((i, elem) => {
            let classInfo = $("div.panel-body>div.row div:nth-child(3)", elem);
            let classTimeInfo = $("div:nth-child(2)", classInfo).text();
            if (classTimeInfo.includes("Cancelled")) {
                return true;
            }
            let courseNum = parseInt($("[id^='class_nbr_']", elem).text());
            let [, course, section, courseName] = $("[id^='class_id_']", elem).text().trim().match(/(\w+ \w+) - (\w+)\s+(.+)/);
            courseToNums[`${course} - ${section} ${courseName}`] = courseNum;
            courseNums.push(courseNum);
        });
        return { courseNums, courseToNums };
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
            url: courseURL
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
                                keyDates[title[0].toLowerCase()][title[1].toLowerCase()] = parsedDates[0];
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
        let { num, year, keyDates } = quarters.spring;
        let { instruction: { begins } } = keyDates;
        let { courseNums, courseToNums } = yield GetCourses(num, year);
        let courses = {};
        for (const courseName in courseToNums) {
            const courseNum = courseToNums[courseName];
            const query = {
                "action": "detail",
                "class_data[:STRM]": num.toString(),
                "binds[:term]": num.toString(),
                "class_data[:CLASS_NBR]": courseNum.toString(),
            };
            const data = new URLSearchParams(query);
            let { data: html } = yield axios_1.default({
                method: "POST",
                url: courseURL,
                data
            });
            let $ = cheerio_1.default.load(html);
            let [, course, section, title] = $("div.panel>div.panel-body>div.row:nth-child(1) h2 ").text().trim().match(/([A-Z]+\s\w+) - (\d+)\s+(.+)/i);
            let panels = $("div.panel>div.panel-body>div.panel-group").children().toArray();
            let type = $("div.panel-body dl.dl-horizontal dd:nth-child(4)", panels[0]).text();
            let [heading, body] = $(panels[panels.length - 1]).children().toArray();
            let headingText = $(heading).text();
            let meets = [];
            let labs = null;
            if (headingText.includes("Labs")) {
                labs = ObtainLabs($, body, keyDates);
                let meetingPanel = $(panels[panels.length - 2]).children().get(1);
                meets = ObtainCourseMeetings(meetingPanel, $, keyDates);
            }
            else {
                let meetingPanel = $(body).children().get(0);
                meets = ObtainCourseMeetings(meetingPanel, $, keyDates);
            }
            let courseObj = {
                course,
                section,
                title,
                num: courseNum,
                labs,
                meets
            };
            console.log(courseObj);
            console.log(courseObj.labs[62603].meet);
            if (courseObj.meets != course_data_1.TBA) {
                console.log(courseObj.meets[0].start.toLocaleString());
                console.log(courseObj.meets[0].end.toLocaleString());
            }
            break;
        }
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
    });
}
main();
//# sourceMappingURL=index.js.map