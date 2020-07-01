
import axios from 'axios'
import cheerio from 'cheerio';
import ical, { day } from "ical-generator";
import { QuarterSchedules, ExamTimes, ExamSchedule } from "../models/final-schedule-data";
import { QuarterSeasons } from "../models/quarter-data";


import { UCSCToIcalDays, LocalTo24Hrs } from "./helper-functions";

import { finalsURL } from "./url-constants";

async function GetFinalDates() {
    let { data: html } = await axios.get(finalsURL);
    let $ = cheerio.load(html);
    let finalExamSchedules = $("div.content.contentBox table>tbody").toArray();
    let quarterSchedules: QuarterSchedules = {};
    for (let table = 0; table < finalExamSchedules.length; table += 2) {
        const schedule = finalExamSchedules[table];

        let [title, categories, ...finalsDate] = $("tr", schedule).toArray();

        let [quarter, year,] = $(title).text().split(" ");
        quarterSchedules[quarter.toLowerCase() as QuarterSeasons] = {
            MWF: [],
            MW: [],
            TuTh: []
        };
        console.log(`${quarter} ${year}`);

        for (let i = 0; i < finalsDate.length - 1; i++) {
            const examSchedule = finalsDate[i];
            let entries = $("td", examSchedule);
            if (entries.length > 1) {
                if ($(entries[0]).text().trim().length == 0) {
                    continue;
                }
                let [ucscDays, classStart, examDate, examTime] = entries.toArray().map(tr => $(tr).text().trim());

                let icalDays = UCSCToIcalDays(ucscDays);

                let convClassStart = classStart ? LocalTo24Hrs(classStart) : "";
                [, examDate] = examDate.split(", ");
                let [examStart, examEnd] = examTime.split("–");
                let period = examEnd.substr(examEnd.length - 5);
                examStart = LocalTo24Hrs(examStart + period);
                examEnd = LocalTo24Hrs(examEnd);
                console.log(`${icalDays} ${convClassStart} ${examDate} ${examStart}-${examEnd}`);

            }
        }
        console.log("-----------");
    }


}

export default { GetFinalDates };