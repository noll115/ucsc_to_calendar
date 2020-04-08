const cheerio = require("cheerio");
const axios = require("axios").default;
const ical = require("ical-generator");

const keyDatesURL = "https://registrar.ucsc.edu/calendar/key-dates/index.html";
const courseUrl = "https://pisa.ucsc.edu/class_search/index.php";


function translateDaysToIcal(daysStr) {
    const possibilities = ["M", "Tu", "W", "Th", "F", "Sa"];
    const iCalDates = ["mo", "tu", "we", "th", "fr", "sa", "su"];
    let days = [];
    possibilities.forEach((day, i) => {
        if (daysStr.includes(day))
            days.push(iCalDates[i]);
    });
    return days;
}


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

        let classLocStr = $("div:nth-child(1)", classInfo).text();

        let classDetails = {
            name: $("[id^='class_id_']", elem).text().replace(/\u00A0+/, ' '),
            number: $("[id^='class_nbr_']", elem).text(),
            meetings: [],
            location: classLocStr.substr(classLocStr.lastIndexOf(":") + 2)
        };

        if (classTimeInfo.includes("TBA")) {
            classDetails.meetings.push({ days: "TBA", time: "TBA" });
        }
        else {
            let str = classTimeInfo.substr(classTimeInfo.indexOf(":") + 2).trim().replace(/\s{2,}/i, " ").split(" ");

            for (let i = 0; i < str.length; i += 2) {
                let meeting = {
                    days: translateDaysToIcal(str[i]),
                    time: str[i + 1]
                }
                classDetails.meetings.push(meeting);
            }


        }
        classes[classDetails.number] = classDetails;

    });
    return classes;
}

async function ObtainLabData(quarterNum, classNum) {
    let labsAvailable = {};
    let { data: html } = await axios({
        method: "POST",
        url: courseUrl,
        data: new URLSearchParams({
            "action": "detail",
            "class_data[:STRM]": quarterNum,
            "class_data[:CLASS_NBR]": classNum
        })
    });
    let $ = cheerio.load(html);
    let [title, labPanel] = $("div.panel.panel-default.row").last().children().toArray();
    let labs = $(labPanel).children();

    if ($(title).text().includes("Sections or Labs")) {
        let labType = null;
        let labTitleRegex = /#(\d+) (\w+) (\w+)/
        $(labs).each((i, lab) => {

            let labInfo = $(lab).children().toArray();
            let [days, time] = $(labInfo[1]).text().split(" ");
            if (days.includes("Cancelled"))
                return true;
            let [, labNum, type, section] = $(labInfo[0]).text().match(labTitleRegex);
            let [, location] = $(labInfo[3]).text().split(": ");
            labType = labType || type;
            let labDetail = {
                labNum,
                section,
                days: translateDaysToIcal(days),
                time,
                loc: location
            }
            labsAvailable[labNum] = labDetail;
        })
        labsAvailable.labType = labType;
    }
    console.log(labsAvailable);
    
    return labsAvailable;
}

function ParseDates(days) {
    let result = null;
    let dateFormat = new RegExp(/[A-Z]+ \d+/, "gi");
    let numbers = new RegExp(/^\d+$/);
    days.forEach((day, i) => {

        if (day.includes("–")) {
            let [month, dates] = day.split(" ");
            let [from, to] = dates.split("–").map(num => Number(num));
            result = [];
            for (let i = from; i < to; i++) {
                result.push(`${month} ${i}`);
            }
        }
        else if (dateFormat.test(day) && numbers.test(days[i + 1])) {
            result = result || [];
            result.push(day);
            let [month, dateNum] = day.split(" ");
            let index = i + 1;
            let currStr = days[index];
            while (numbers.test(currStr)) {
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
    let [year, currentQuarter, _] = quarterElem.text().split(" ");

    // let quarters = await ObtainQuarterDates();
    let classes = await GetClasses(quarterNum);
    let cal = ical({ domain: "ucsc-cal.com", name: "ucsc" });
    let date = new Date();
    let event = cal.createEvent({
        start: date,
        summary: "YES",
        location: "house",

    })
    // console.log(event);

    console.log(JSON.stringify(classes[62801], null, 2));
    console.log(JSON.stringify(classes[62602], null, 2));
    console.log();
    ObtainLabData(quarterNum, 63856)




}


try {
    main();


} catch (error) {
    console.log(error);

}