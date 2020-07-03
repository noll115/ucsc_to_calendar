
import axios from 'axios'
import { Quarter, Quarters, QuarterSeasons, KeyDates } from "../types/quarter";
import { ParseDates } from "./helper-functions";

import cheerio from "cheerio";

import { courseSearchURL, keyDatesURL } from "./url-constants";



async function ObtainCurrentQuarters() {
    let { data: coursePageHTML } = await axios({
        method: "GET",
        url: courseSearchURL
    });

    let page = cheerio.load(coursePageHTML);
    let quarters: Quarters = {};
    for (let i = 1; i < 3; i++) {
        let quarterElem = page(`#term_dropdown>option:nth-child(${i})`);
        let [year, season,] = quarterElem.text().split(" ");
        let current = quarterElem.attr("selected")?.valueOf() !== undefined;
        let quarter: Quarter = {
            year: parseInt(year),
            id: parseInt(quarterElem.attr("value")),
            current,
            keyDates: null
        };
        season = season.toLowerCase();
        quarters[season as QuarterSeasons] = quarter;
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



async function GetCurrentQuarters(): Promise<Quarters> {
    let currentQuarters = await ObtainCurrentQuarters();
    await SetKeyDates(currentQuarters);
    return currentQuarters;
}


export { GetCurrentQuarters };