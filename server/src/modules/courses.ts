import axios from 'axios'
import { Course, Labs, Lab, Meeting, TBA } from "../models/course-data";
import { KeyDates } from "../models/quarter-data";
import { GetFirstMeeting, UCSCToIcalDays } from "./helper-functions";

export function Init(courseURL: string) {


    async function GetCourses(quarterNum: number, year: number): Promise<{ [index: string]: number }> {

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

        let courses: { [index: string]: number } = {};

        $("[id^='rowpanel_']").each((i, elem) => {
            let classInfo = $("div.panel-body>div.row div:nth-child(3)", elem);
            let classTimeInfo = $("div:nth-child(2)", classInfo).text();

            if (classTimeInfo.includes("Cancelled")) {
                return true;
            }
            let courseNum = parseInt($("[id^='class_nbr_']", elem).text());

            let [, course, section, courseName] = $("[id^='class_id_']", elem).text().trim().match(/(\w+ \w+) - (\w+)\s+(.+)/);
            courses[`${course} - ${section} ${courseName}`] = courseNum;
        });
        return courses;
    }


    function ObtainLabs($: CheerioStatic, labPanel: CheerioElement, keyDates: KeyDates): Labs {
        let labsAvailable: Labs = { type: '' };
        let labs = $(labPanel).children();

        let labTitleRegex = /#(\d+) (\w+) (\w+)/;
        $(labs).each((i, lab) => {
            let labDetail: Lab = null;
            let labInfo = $(lab).children().toArray();
            let [days, timeSlot] = $(labInfo[1]).text().split(" ");
            if (days.includes("Cancelled"))
                return true;
            let [, labNum, type, section] = $(labInfo[0]).text().match(labTitleRegex);
            if (days.includes("TBA")) {
                labDetail = {
                    num: parseInt(labNum),
                    sect: section,
                    meet: TBA
                }
            }
            else {
                let meetingDays = UCSCToIcalDays(days);
                let [, location] = $(labInfo[3]).text().split(": ");
                labsAvailable.type = labsAvailable.type || type;
                let [startTime, endTime] = GetFirstMeeting(keyDates, timeSlot, meetingDays[0])
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
        })

        return labsAvailable;
    }


    function ObtainCourseMeetings(meetingPanel: Cheerio, $: CheerioStatic, keyDates: KeyDates) {
        let trElems = $("tr", meetingPanel).toArray();
        let meets: Meeting[] = [];
        for (let i = 1; i < trElems.length; i++) {
            const tr = trElems[i];
            let [time, loc, instr, meetingDates] = $("td", tr).toArray().map(el => $(el).text());
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
        return meets;
    }

    async function QueryCourse(quarterNum: string, keyDates: KeyDates, courseNum?: string, courseName?: string): Promise<Course> {
        const query: Record<string, string> = {
            "action": "detail",
            "class_data[:STRM]": courseNum,
            "binds[:term]": quarterNum,
            "class_data[:CLASS_NBR]": courseNum.toString(),
        };
        const data = new URLSearchParams(query);
        let { data: html } = await axios({
            method: "POST",
            url: courseURL,
            data
        });
        let $ = cheerio.load(html);
        let [, course, section, title] = $("div.panel>div.panel-body>div.row:nth-child(1) h2 ").text().trim().match(/([A-Z]+\s\w+) - (\d+)\s+(.+)/i);
        let panels = $("div.panel>div.panel-body>div.panel-group").children().toArray();
        let type = $("div.panel-body dl.dl-horizontal dd:nth-child(4)", panels[0]).text();
        let [heading, body] = $(panels[panels.length - 1]).children().toArray();
        let headingText = $(heading).text();
        let meets: Meeting[] = [];
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
        return {
            course,
            section,
            title,
            type,
            num: parseInt(courseNum),
            labs,
            meets
        };
    }

    return { QueryCourse, GetCourses }
}
