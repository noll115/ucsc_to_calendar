const cheerio = require("cheerio");
const puppeteer = require("puppeteer");
const axios = require("axios").default;


const keyDatesURL = "https://registrar.ucsc.edu/calendar/key-dates/index.html";
const courseUrl = "https://pisa.ucsc.edu/class_search/index.php";



async function GetClasses(quarterNum) {
    const params = new URLSearchParams({
        "action": "results",
        "binds[:term]": quarterNum,
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
        "rec_start": 0,
        "rec_dur": 9999
    });
    let { data: html } = await axios({
        method: "POST",
        url: courseUrl,
        data: params
    });

    let $ = cheerio.load(html);
    let classes = {};

    $("[id^='rowpanel']").each((i, elem) => {
        let classInfo = $("div.panel-body>div.row div:nth-child(3)", elem);
        let classTimeInfo = $("div:nth-child(2)", classInfo).text();
        if (classTimeInfo.includes("Cancelled")) {
            return true;
        }
        let classDetails = {
            name: $("[id^='class_id_']", elem).text().replace(/\u00A0+/g, ' '),
            number: $("[id^='class_nbr_']", elem).text(),
        };
        let classLoc = $("div:nth-child(1)", classInfo).text();
        classDetails.location = classLoc.substr(classLoc.lastIndexOf(":") + 2);
        if (classTimeInfo.includes("TBA")) {
            classDetails.days = "TBA";
            classDetails.time = "TBA";
        }
        else {
            [classDetails.days, classDetails.time] = classTimeInfo.substr(classTimeInfo.indexOf(":") + 2).trim().split(" ");
        }
        classes[classDetails.number] = classDetails;

    });
    return classes;
}

function ParseDates(days) {
    let result = null;
    days.forEach((day, i) => {

        if (day.includes("–")) {
            let [month, dates] = day.split(" ");
            let [from, to] = dates.split("–").map(num => Number(num));
            result = [];
            for (let i = from; i < to; i++) {
                result.push(`${month} ${i}`);
            }
        }
        else if (/[A-Z]+ \d+/gi.test(day) && /^\d+$/.test(days[i + 1])) {
            result = result || [];
            result.push(day);
            let [month, dateNum] = day.split(" ");
            let index = i + 1;
            let currStr = days[index];
            while (/^\d+$/.test(currStr)) {
                result.push(`${month} ${currStr}`);
                currStr = days[++index]
            }
        }
    })
    return result || days;
}

async function ObtainQuarterDates() {
    let { data: keyDatesHTML } = await axios({
        method: "GET",
        url: keyDatesURL
    });
    let $ = cheerio.load(keyDatesHTML, {
        decodeEntities: false
    });
    let quarterStrRegex = new RegExp(`([A-Z]+) ([A-Z]+) (\\d+)`, "gi");
    let trSelect = $("#main tbody>tr").toArray();
    let quarters = {};
    for (let i = 0; i < trSelect.length; i++) {
        let elemStr = $(trSelect[i]).text();
        let tokens = quarterStrRegex.exec(elemStr);
        if (tokens) {
            let quarter = {};
            quarter.name = elemStr.trim();
            let lastElemIndex = i + 7;
            for (i += 1; i < Math.min(lastElemIndex, trSelect.length); i++) {
                let node = $(trSelect[i]);
                let title = node.children("td:nth-child(1)").text().trim().split(" ");
                let dates = node.children("td:nth-child(2)").html().match("<p>(.+)<br>")[1].trim().split(", ");

                dates = ParseDates(dates);
                if (title.length == 1) {
                    quarter[title[0]] = dates;
                } else {
                    if (title.includes("Final")) {
                        quarter["Finals"] = dates;
                    } else {
                        quarter[title[0]] = quarter[title[0]] || {};
                        quarter[title[0]][title[1]] = dates
                    }
                }
            }
            quarters[tokens[1]] = quarter;
        }
    }
    return quarters;
}


async function main() {
    let { data: coursePageHTML } = await axios({
        method: "GET",
        url: courseUrl
    });

    let page = cheerio.load(coursePageHTML);
    let quarterElem = page("#term_dropdown>option[selected='selected']");
    let quarterNum = quarterElem.attr("value");
    let [year, quarterName, _] = quarterElem.text().split(" ");

    let quarters = await ObtainQuarterDates();
    let classes = await GetClasses(quarterNum);

}


try {
    main();


} catch (error) {
    console.log(error);

}