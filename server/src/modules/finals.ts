const finalURL = "https://registrar.ucsc.edu/soc/final-examinations.html"
import axios from 'axios'
import cheerio from 'cheerio';
import ical, { day } from "ical-generator";

import { UCSCToIcalDays, LocalTo24Hrs } from "./helper-functions";


async function GetFinalDates() {
    let { data: html } = await axios.get(finalURL);
    let $ = cheerio.load(html);
    let finalExamSchedules = $("div.content.contentBox table:nth-child(odd) tbody");
    finalExamSchedules.each((i, el) => {
        let dates = $("tr", el);
        dates.each((i, date) => {
            console.log($(date).text().trim());
            
        })
    })

}

export default {GetFinalDates};