import axios from 'axios'
import { Course, CourseCatalogue, Meeting, KeyDates, Labs, Lab } from "../../../shared/types";
import { GetFirstMeeting, UCSCToIcalDays } from "./helper-functions";
import cheerio from "cheerio";
import { courseSearchURL } from "./url-constants";


async function GetAllCoursesIDs(courseID: number): Promise<CourseCatalogue> {

    const query: Record<string, string> = {
        "action": "results",
        "binds[:term]": courseID.toString(),
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
        url: courseSearchURL,
        data
    });

    let $ = cheerio.load(html);

    let courses: CourseCatalogue = {};

    $("[id^='rowpanel_']").each((i, elem) => {
        let classInfo = $("div.panel-body>div.row div:nth-child(3)", elem);
        let classTimeInfo = $("div:nth-child(2)", classInfo).text();

        if (classTimeInfo.includes("Cancelled")) {
            return true;
        }
        let courseID = parseInt($("[id^='class_nbr_']", elem).text());

        let [, course, section, fullCourseName] = $("[id^='class_id_']", elem).text().trim().match(/(\w+ \w+) - (\w+)\s+(.+)/);
        let [subject, courseNum] = course.split(" ");

        if (courses[subject] === undefined) {
            courses[subject] = {};
        }
        let coursesUnderSubject = courses[subject];
        if (coursesUnderSubject[courseNum]) {
            coursesUnderSubject[courseNum][section] = courseID;
        } else {
            coursesUnderSubject[courseNum] = { [section]: courseID }
        }
    });
    return courses;
}


function ObtainLabInfos($: CheerioStatic, labPanel: CheerioElement, keyDates: KeyDates): Labs {
    let labsAvailable: Labs = { type: '' };
    let labs = $(labPanel).children();

    let labTitleRegex = /#(\d+) (\w+) (\w+)/;
    $(labs).each((i, lab) => {
        let labDetail: Lab = null;
        let labInfo = $(lab).children().toArray();
        let [days, timeSlot] = $(labInfo[1]).text().split(" ");
        if (days.includes("Cancelled"))
            return true;

        let [, labIDString, type, section] = $(labInfo[0]).text().match(labTitleRegex);
        let labID = parseInt(labIDString);
        labsAvailable.type = labsAvailable.type || type;
        if (days.includes("TBA")) {
            labDetail = {
                id: labID,
                sect: section,
                meet: "TBA"
            }
        }
        else if (days.length == 0) {
            labDetail = {
                id: labID,
                sect: section,
                meet: "N/A"
            }
        }
        else {
            let meetingDays = UCSCToIcalDays(days);
            let [, location] = $(labInfo[3]).text().split(": ");

            let [startTime, endTime] = GetFirstMeeting(keyDates, timeSlot, meetingDays[0])

            labDetail = {
                id: labID,
                sect: section,
                meet: {
                    days: meetingDays,
                    start: startTime,
                    end: endTime,
                    loc: location
                },
            };
        }
        labsAvailable[labDetail.id] = labDetail;
    })

    return labsAvailable;
}


function ObtainCourseMeetingInfo(meetingPanel: Cheerio, $: CheerioStatic, keyDates: KeyDates): [Meeting[], string] {
    let trElems = $("tr", meetingPanel).toArray();
    let meets: Meeting[] = [];
    let instructor: string;
    for (let i = 1; i < trElems.length; i++) {
        const tr = trElems[i];
        let [time, loc, instr, meetingDates] = $("td", tr).toArray().map(el => $(el).text());
        instructor = instr;
        let [days, timeSlot] = time.split(" ");
        let meetingDays = UCSCToIcalDays(days);

        let [startTime, endTime] = GetFirstMeeting(keyDates, timeSlot, meetingDays[0])
        meets.push({
            days: meetingDays,
            start: startTime,
            end: endTime,
            loc
        });
    }
    return [meets, instructor];
}

async function QueryCourse(quarterID: number, keyDates: KeyDates, courseID: string): Promise<Course> {
    const query: Record<string, string> = {
        "action": "detail",
        "class_data[:STRM]": quarterID.toString(),
        "binds[:term]": quarterID.toString(),
        "class_data[:CLASS_NBR]": courseID,
    };
    const data = new URLSearchParams(query);
    let { data: html } = await axios({
        method: "POST",
        url: courseSearchURL,
        data
    });
    let $ = cheerio.load(html);
    let [, shortName, section, fullName] = $("div.panel>div.panel-body>div.row:nth-child(1) h2").text().trim().match(/([A-Z]+\s\w+) - (\d+)\s+(.+)/i);
    let panels = $("div.panel>div.panel-body>div.panel-group>.panel").toArray();
    let type = $("div.panel-body dl dd:nth-child(8)", panels[0]).first().text();

    let [heading, body] = $(panels[panels.length - 1]).children().toArray();
    let headingText = $(heading).text();
    let meets: Meeting[] = [];
    let instructor: string = "";
    let labs = null;
    if (headingText.includes("Labs")) {
        labs = ObtainLabInfos($, body, keyDates);
        let meetingPanel = $(panels[panels.length - 2]).children().get(1);
        [meets, instructor] = ObtainCourseMeetingInfo(meetingPanel, $, keyDates);
    }
    else {
        let meetingPanel = $(body).children().get(0);
        [meets, instructor] = ObtainCourseMeetingInfo(meetingPanel, $, keyDates);
    }
    return {
        shortName,
        sect: section,
        fullName,
        type,
        inst: instructor,
        id: parseInt(courseID),
        labs,
        meets
    };
}

export { QueryCourse, GetAllCoursesIDs };
