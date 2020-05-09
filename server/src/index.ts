import cheerio from 'cheerio';
import axios from 'axios'
import ical, { day } from "ical-generator";
import { promises as fsPromise } from "fs";
import { Courses, Course, Labs, Lab, Meeting, TBA, UCSCDates, iCalDates } from "./models/course-data";
import { Quarter, Quarters, QuarterSeasons, KeyDates } from "./models/quarter-data";

const keyDatesURL = "https://registrar.ucsc.edu/calendar/key-dates/index.html";
const courseURL = "https://pisa.ucsc.edu/class_search/index.php";
const finalURL = "https://registrar.ucsc.edu/soc/final-examinations.html"


function UCSCToIcalDays(daysStr: string): day[] {
    let days: day[] = [];
    UCSCDates.forEach((day, i) => {
        if (daysStr.includes(day))
            days.push(iCalDates[i]);
    });
    return days;
}

function ObtainLabData($: CheerioStatic, labPanel: CheerioElement): Labs {
    let labsAvailable: Labs = { type: '' };
    let labs = $(labPanel).children();

    let labTitleRegex = /#(\d+) (\w+) (\w+)/;
    $(labs).each((i, lab) => {

        let labInfo = $(lab).children().toArray();
        let [days, time] = $(labInfo[1]).text().split(" ");
        if (days.includes("Cancelled"))
            return true;

        let [, labNum, type, section] = $(labInfo[0]).text().match(labTitleRegex);
        let [, location] = $(labInfo[3]).text().split(": ");
        labsAvailable.type = labsAvailable.type || type;
        let [start, end] = time.split("-");
        let labDetail: Lab = {
            num: parseInt(labNum),
            sect: section,
            meet: days.includes("TBA") ? TBA : {
                days: UCSCToIcalDays(days),
                start: localTo24Hrs(start),
                end: localTo24Hrs(end),
                loc: location
            },
        };
        labsAvailable[labDetail.num] = labDetail;
    })

    return labsAvailable;
}


function localTo24Hrs(local: string) {
    let timeRegex = new RegExp(/(\d{2}):(\d{2})(PM|AM)/);
    let [, hours, minutes, period] = timeRegex.exec(local);
    if (period === "PM") {
        let convHrs = parseInt(hours) + 12;
        return `${convHrs}:${minutes}`;
    }
    return `${hours}:${minutes}`;
}

function firstDayInMonth(day: day, month: number, year: number, { start, end }: Meeting): Date[] {
    let days = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
    let dayChosen = days.indexOf(day);
    let [startHr, startMin] = start.split(":").map(str => parseInt(str));
    let [endHr, endMin] = end.split(":").map(str => parseInt(str));
    // day is in range 0 Sunday to 6 Saturday
    let firstDay = 1 + (dayChosen - new Date(year, month, 1).getDay() + 7) % 7;
    return [new Date(year, month, firstDay, startHr, startMin), new Date(year, month, firstDay, endHr, endMin)];
}


async function GetCourses(quarterNum: number, year: number): Promise<{ courseNums: number[], courseToNums: { [index: string]: number } }> {

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
        url: courseURL,
        data
    });

    let $ = cheerio.load(html);

    let courseNums: number[] = [];
    let courseToNums: { [index: string]: number } = {};

    $("[id^='rowpanel_']").each((i, elem) => {
        let classInfo = $("div.panel-body>div.row div:nth-child(3)", elem);
        let classTimeInfo = $("div:nth-child(2)", classInfo).text();
        
        if (classTimeInfo.includes("Cancelled")) {
            return true;
        }
        let courseNum = parseInt($("[id^='class_nbr_']", elem).text());
        
        let [, course, section, courseName] = $("[id^='class_id_']", elem).text().trim().match(/(\w+ \w+) - (\w+)\s+(.+)/);
        courseToNums[`${course} - ${section} ${courseName}`] = courseNum;
        
    });
    return { courseNums, courseToNums };
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
        url: courseURL
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
                            keyDates[title[0].toLowerCase()][title[1].toLowerCase()] = parsedDates[0];
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
    let { num, year, keyDates } = quarters.spring;
    let { instruction: { begins } } = keyDates
    // let { courseNums, courseToNums } = await GetCourses(num, year);

    // let courses: Courses = {};
    let date = new Date(year,begins.getMonth(),begins.getDate());
    console.log(date);
    for (let i = 1; i < 8; i++) {
        console.log(new Date(date.getFullYear(),date.getMonth(),date.getDate()+i));
    }
    


    // for (let i = 0; i < courseNums.length; i++) {
    //     const courseNum = courseNums[i];
    //     const query: Record<string, string> = {
    //         "action": "detail",
    //         "class_data[:STRM]": num.toString(),
    //         "binds[:term]": num.toString(),
    //         "class_data[:CLASS_NBR]": courseNum.toString(),
    //     }
    //     const data = new URLSearchParams(query);
    //     let { data: html } = await axios({
    //         method: "POST",
    //         url: courseURL,
    //         data
    //     });


    //     let $ = cheerio.load(html);
    //     let [, course, section, title] = $("div.panel>div.panel-body>div.row:nth-child(1) h2 ").text().trim().match(/([A-Z]+\s\w+) - (\d+)\s+(.+)/i);
    //     let panels = $("div.panel>div.panel-body>div.panel-group").children().toArray();
    //     let type = $("div.panel-body dl.dl-horizontal dd:nth-child(4)", panels[0]).text();
    //     let [heading, body] = $(panels[panels.length - 1]).children().toArray();
    //     let headingText = $(heading).text();
    //     let meets = [];
    //     let labs = null;
    //     if (headingText.includes("Labs")) {
    //         labs = ObtainLabData($, body);
    //         let meetingPanel = $(panels[panels.length - 2]).children().get(1);
    //         let trElems = $("tr", meetingPanel).toArray();
    //         for (let i = 1; i < trElems.length; i++) {
    //             const tr = trElems[i];
    //             let [time, loc, instr, meetingDates] = $("td", tr).toArray().map(el => $(el).text());
    //             let [days, timeslot] = time.split(" ");
    //             let [start, end] = timeslot.split("-");
    //             meets.push({
    //                 days: UCSCToIcalDays(days),
    //                 start: localTo24Hrs(start),
    //                 end: localTo24Hrs(end),
    //                 loc
    //             });
    //         }
    //     } else {
    //         let meetingPanel = $(body).children().get(0);
    //         let trElems = $("tr", meetingPanel).toArray();
    //         for (let i = 1; i < trElems.length; i++) {
    //             const tr = trElems[i];
    //             let [time, loc, instr, meetingDates] = $("td", tr).toArray().map(el => $(el).text());
    //             let [days, timeslot] = time.split(" ");
    //             let [start, end] = timeslot.split("-").map(time => localTo24Hrs(time));
    //             let meetingDays = UCSCToIcalDays(days);
    //             //get first working day of week not month
    //             // let [startTime, endTime] = firstDayInMonth(meetingDays[0])
    //             // meets.push({
    //             //     days: meetingDays,
    //             //     start: ,
    //             //     end: ,
    //             //     loc
    //             // });
    //         }
    //     }
    //     let courseObj: Course = {
    //         course,
    //         section,
    //         title,
    //         num: courseNum,
    //         labs,
    //         meets
    //     };

    // }
    // let courseSelected = classes[62602];
    // let { keyDates } = quarters.spring;
    // console.log(keyDates);
    // console.log(courseSelected);
    // console.log(courseSelected.meets);
    // let { meets } = courseSelected;
    // let { begins, ends } = keyDates.instruction;
    // let [startDate, endDate] = firstDayInMonth(meets[0].days[0], begins.getMonth(), quarter.year, meets[0]);
    // console.log(startDate.toLocaleString());
    // console.log(endDate.toLocaleString());

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

}


main();
