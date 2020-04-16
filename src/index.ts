import cheerio from 'cheerio';
import axios from 'axios'
import ical, { day } from "ical-generator";
import { promises as fsPromise } from "fs";
import { Courses, Course, Labs, Lab, Meeting } from "./models/course-data";
import { Quarter, Quarters, QuarterSeasons, KeyDates } from "./models/quarter-data";

const keyDatesURL = "https://registrar.ucsc.edu/calendar/key-dates/index.html";
const courseUrl = "https://pisa.ucsc.edu/class_search/index.php";


function translateDaysToIcal(daysStr: string): day[] {
    const possibilities = ["M", "Tu", "W", "Th", "F", "Sa"];
    const iCalDates = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];
    let days: day[] = [];
    possibilities.forEach((day, i) => {
        if (daysStr.includes(day))
            days.push(iCalDates[i] as day);
    });
    return days;
}

async function ObtainLabData(quarterNum: number, classNum: number): Promise<Labs> {
    let labsAvailable: Labs = { type: '' };
    let query: Record<string, string> = {
        "action": "detail",
        "class_data[:STRM]": quarterNum.toString(),
        "class_data[:CLASS_NBR]": classNum.toString()
    }

    let { data: html } = await axios({
        method: "POST",
        url: courseUrl,
        data: new URLSearchParams(query)
    });
    let $ = cheerio.load(html);
    let [title, labPanel] = $("div.panel.panel-default.row").last().children().toArray();
    let labs = $(labPanel).children();

    if ($(title).text().includes("Sections or Labs")) {
        let labTitleRegex = /#(\d+) (\w+) (\w+)/
        $(labs).each((i, lab) => {

            let labInfo = $(lab).children().toArray();
            let [days, time] = $(labInfo[1]).text().split(" ");
            if (days.includes("Cancelled"))
                return true;
            let [, labNum, type, section] = $(labInfo[0]).text().match(labTitleRegex);
            let [, location] = $(labInfo[3]).text().split(": ");
            labsAvailable.type = labsAvailable.type || type;
            let labDetail: Lab = {
                num: parseInt(labNum),
                sect: section,
                meet: {
                    days: translateDaysToIcal(days),
                    time
                },
                loc: location
            }
            labsAvailable[labDetail.num] = labDetail;
        })
    }

    return labsAvailable;
}



async function GetClasses(quarterNum: number): Promise<Courses> {

    const query: Record<string, string> = {
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
    }
    const data = new URLSearchParams(query);
    let { data: html } = await axios({
        method: "POST",
        url: courseUrl,
        data
    });

    let $ = cheerio.load(html);
    let courses: Courses = {};

    $("[id^='rowpanel']").each(async (i, elem) => {
        let classInfo = $("div.panel-body>div.row div:nth-child(3)", elem);
        let classTimeInfo = $("div:nth-child(2)", classInfo).text();
        if (classTimeInfo.includes("Cancelled")) {
            return true;
        }

        let classLocStr = $("div:nth-child(1)", classInfo).text();
        let courseNum = parseInt($("[id^='class_nbr_']", elem).text());
        let courseDetails: Course = {
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
                let meeting: Meeting = {
                    days: translateDaysToIcal(str[i]),
                    time: str[i + 1]
                }
                courseDetails.meets.push(meeting);
            }
        }
        courses[courseDetails.num] = courseDetails;

    });
    return courses;
}



function ParseDates(days: string[], year: number): Date[] {
    let result: Date[] = [];
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
                currStr = days[++index]
            }
        } else if (inDateFormat.test(day)) {
            result.push(new Date(`${day} ${year}`))
        }
    })
    return result;
}


async function ObtainCurrentQuarters() {
    let { data: coursePageHTML } = await axios({
        method: "GET",
        url: courseUrl
    });

    let page = cheerio.load(coursePageHTML);
    let quarters: Quarters = {};
    for (let i = 1; i < 3; i++) {
        let quarterElem = page(`#term_dropdown>option:nth-child(${i})`);
        let [year, season,] = quarterElem.text().split(" ");
        let current = quarterElem.attr("selected")?.valueOf() !== undefined;
        let quarter: Quarter = {
            year: parseInt(year),
            num: parseInt(quarterElem.attr("value")),
            season: season.toLowerCase() as QuarterSeasons,
            current,
            keyDates: null
        };
        quarters[quarter.season] = quarter;
    }
    return quarters;
}



async function SetKeyDates(currentQuarters: Quarters) {
    let { data: keyDatesHTML } = await axios({
        method: "GET",
        url: keyDatesURL
    });
    let $ = cheerio.load(keyDatesHTML, {
        decodeEntities: false
    });
    let quarterStrRegex = new RegExp(`([A-Z]+) [A-Z]+ \\d+`, "i");
    let trSelect = $("#main tbody>tr").toArray();
    for (let i = 0; i < trSelect.length; i++) {
        let elemStr = $(trSelect[i]).text();
        let tokens = quarterStrRegex.exec(elemStr);
        if (tokens) {
            let season = tokens[1].toLowerCase() as QuarterSeasons;
            if (season in currentQuarters) {

                let quarter = currentQuarters[season];
                let keyDates: KeyDates = {
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
                    } else {
                        if (title.includes("Final")) {
                            keyDates.finals = parsedDates;
                        } else {
                            keyDates[title[0].toLowerCase()][title[1].toLowerCase()] = parsedDates
                        }
                    }
                }
                quarter.keyDates = keyDates;
            }
        }
    }
}


async function GetQuarters(): Promise<Quarters> {
    let currentQuarters = await ObtainCurrentQuarters();
    await SetKeyDates(currentQuarters);
    return currentQuarters;
}

async function main() {
    let quarters = await GetQuarters();
    let classes: Courses = JSON.parse(await fsPromise.readFile("./data/courses.json", { encoding: "utf-8" }));
    let courseSelected = classes[62602];
    let { keyDates } = quarters.spring;
    let cal = ical({ domain: "ucsc-cal.com", name: "ucsc" });
    let event = cal.createEvent({
        start: keyDates.instruction.begins,
        summary: "YES",
        location: "house",
        end: keyDates.instruction.ends
    });
    event.repeating({
        freq: "WEEKLY",
        exclude: keyDates.holidays,
        byDay: courseSelected.meets[0].days,
    })
}


main();
