
import axios from 'axios'
import { Quarter, Quarters, QuarterSeasons, KeyDates, RecentQuarters } from "../../../shared/types";

import cheerio from "cheerio";

import { courseSearchURL, keyDatesURL, futureCalendarURL } from "./url-constants";
import { GetAllCoursesIDs } from './courses';



async function ObtainRecentQuarters(): Promise<RecentQuarters> {
    let { data: coursePageHTML } = await axios({
        method: "GET",
        url: courseSearchURL
    });

    let page = cheerio.load(coursePageHTML);
    let quarters: Quarters = {};
    let currentQuarter: QuarterSeasons;
    for (let i = 1; i < 3; i++) {
        let quarterElem = page(`#term_dropdown>option:nth-child(${i})`);
        let [year, season,] = quarterElem.text().split(" ");
        let isCurrent = quarterElem.attr("selected")?.valueOf() !== undefined;
        let quarterID = parseInt(quarterElem.attr("value"));
        let quarter: Quarter = {
            year: parseInt(year),
            id: quarterID,
            keyDates: null,
            courses: await GetAllCoursesIDs(quarterID)
        };
        let quarterSeason = season.toLowerCase() as QuarterSeasons;
        if (isCurrent) {
            currentQuarter = quarterSeason;
        }
        quarters[quarterSeason] = quarter;
    }
    return { quarters, currentQuarter };
}


function parseKeyDates(date: string, year: number) {
    let dates: Date[] = [];
    if (date.indexOf("-") !== -1) {
        let [, month, firstDay, lastDay] = /(\d+)\/(\d+)-(\d+).*/.exec(date);

        let firstDayNum = parseInt(firstDay);
        let lastDayNum = parseInt(lastDay);
        while (firstDayNum <= lastDayNum) {
            dates.push(new Date(`${month}/${firstDayNum}/${year}`));
            firstDayNum++;
        }
    }
    else {
        dates.push(new Date(`${date}/${year}`))
    }
    return dates;
}

async function SetKeyDatesNew(currentQuarters: Quarters) {
    let { data: keyDatesHTML } = await axios({
        method: "GET",
        url: futureCalendarURL
    });
    let $ = cheerio.load(keyDatesHTML, {
        decodeEntities: false
    });
    let [fall, winter, spring,] = $("#mainContent>div.content>table>tbody").toArray();
    let tableMap: Record<QuarterSeasons, CheerioElement> = {
        fall,
        winter,
        spring,
        summer: null
    }
    for (const key in currentQuarters) {
        let quarterSeason = key as QuarterSeasons;
        let quarter = currentQuarters[quarterSeason];
        if (quarterSeason === "summer") {
            //special case cuz future URL does not contain summer
            await GetSummerKeyDates(quarter);
        }
        else {
            let table = tableMap[quarterSeason];
            let yearIndex = -1;
            $("tr:nth-child(1)", table).children().each((i, el) => {
                if ($(el).text().indexOf(quarter.year.toString()) !== -1)
                    yearIndex = i;
            });
            let keyDates: KeyDates = {
                finals: [],
                holidays: [],
                instruction: { begins: null, ends: null },
                quarter: { begins: null, ends: null }
            };
            let trElements = $("tr", table);
            let lastTr = trElements.last();
            let currentEl = $(trElements.get(1));

            while (!currentEl.is(lastTr)) {
                let title = $("th", currentEl).text();
                let lastSpaceIndex = title.lastIndexOf(" ");
                let majorKey = title.substr(0, lastSpaceIndex).toLowerCase();
                let minorKey = title.substr(lastSpaceIndex + 1).toLowerCase();

                let [date,] = $(currentEl.children().get(yearIndex)).first().text().split(" ")
                if (minorKey === "holiday") {

                    let dates = parseKeyDates(date, quarter.year);
                    keyDates.holidays = (keyDates.holidays as Date[]).concat(dates);
                } else if (minorKey === "exams") {
                    let dates = parseKeyDates(date, quarter.year);
                    keyDates.finals = dates;
                } else if (keyDates[majorKey]) {
                    keyDates[majorKey][minorKey] = new Date(`${date}/${quarter.year}`)
                }
                currentEl = currentEl.next();
            }

            quarter.keyDates = keyDates;
        }

    }


}

async function GetSummerKeyDates(summerQuarter: Quarter) {
    let { data: keyDatesHTML } = await axios({
        method: "GET",
        url: keyDatesURL
    });
    let $ = cheerio.load(keyDatesHTML, {
        decodeEntities: false
    });
    let keyDates: KeyDates = {
        finals: [],
        holidays: [],
        instruction: { begins: null, ends: null },
        quarter: { begins: null, ends: null }
    };
    let trElements = $("#main tbody>tr");
    let summerTitle = trElements.filter((i, el) => $(el).text().indexOf("Summer") !== -1);
    let currentElement = summerTitle.next();
    let lastTr = trElements.last();
    while (!currentElement.is(lastTr)) {
        let info = $("td p", currentElement).toArray();
        let [majorKey, minorKey] = $(info[0]).text().split(" ").map(str => str.toLowerCase());
        
        let date = $(info[1]).html().split("<br>")[0].trim();
        if (majorKey === "holiday") {
            keyDates.holidays = [new Date(`${date} ${summerQuarter.year}`)];
        } else {
            
            keyDates[majorKey][minorKey] = new Date(`${date} ${summerQuarter.year}`)
            
        }
        currentElement = currentElement.next()
    }
    let date = $("td p", currentElement).last().html().split("<br>")[0];

    keyDates.quarter.ends = new Date(`${date} ${summerQuarter.year}`);
    summerQuarter.keyDates = keyDates;

}



async function GetAvailableQuarters(): Promise<RecentQuarters> {
    let recentQuarters = await ObtainRecentQuarters();
    await SetKeyDatesNew(recentQuarters.quarters);
    return recentQuarters;
}



export { GetAvailableQuarters };