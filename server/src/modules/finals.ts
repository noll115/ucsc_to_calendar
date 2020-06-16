const finalURL = "https://registrar.ucsc.edu/soc/final-examinations.html"
import axios from 'axios'
import cheerio from 'cheerio';
import ical, { day } from "ical-generator";
import { QuarterSchedules, ExamTimes, ExamSchedule } from "../models/final-schedule-data";
import { QuarterSeasons } from "../models/quarter-data";


import { UCSCToIcalDays, LocalTo24Hrs } from "./helper-functions";


async function GetFinalDates() {
    let { data: html } = await axios.get(finalURL);
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
        for (let i = 0; i < finalsDate.length - 1; i++) {
            const examSchedule = finalsDate[i];
            let entries = $("td", examSchedule);
            if (entries.length > 1) {
                let [classDays, classStart, examDate, examTime] = entries.toArray().map(tr => $(tr).text().trim());
                examDate.length > 0 && console.log(`${classDays} ${classStart} ${examDate} ${examTime}`);

            }
        }
        console.log("-----------");
    }


}

export default { GetFinalDates };