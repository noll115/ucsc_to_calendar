const finalURL = "https://registrar.ucsc.edu/soc/final-examinations.html"
import axios from 'axios'
import cheerio from 'cheerio';
import ical, { day } from "ical-generator";

import { UCSCToIcalDays, LocalTo24Hrs } from "./helper-functions";


async function GetFinalDates() {
    let { data: html } = await axios.get(finalURL);
    let $ = cheerio.load(html);
    let finalExamSchedules = $("div.content.contentBox table>tbody").toArray();
    for (let table = 0; table < finalExamSchedules.length; table += 2) {
        const schedule = finalExamSchedules[table];

        let [title, categories, ...finalsDate] = $("tr", schedule).toArray();
        console.log($(title).text().trim());
        for (let i = 0; i < finalsDate.length - 1; i++) {
            const examSchedule = finalsDate[i];
            let entries = $("td", examSchedule).toArray();

            if (entries.length > 1) {
                let [classDays, classStart, examDate, examTime] = entries.map(tr => $(tr).text().trim());
                examDate.length > 0 && console.log(examDate);

            }
        }
        console.log("-----------");
    }


}

export default { GetFinalDates };