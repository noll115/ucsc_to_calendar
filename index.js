const cheerio = require("cheerio");
const puppeteer = require("puppeteer");
const axios = require("axios").default;


const datesUrl = "https://registrar.ucsc.edu/calendar/key-dates/index.html";
const courseUrl = "https://pisa.ucsc.edu/class_search/index.php";



async function GetClasses(page) {

    await page.select("#reg_status", "all");
    await page.click("input[type='submit']");
    let elem = await page.waitForSelector("[id='rec_dur']>[value='100']");
    await page.evaluate((elem) => {
        elem.value = 9999;
    }, elem);
    let s;
    page.on('response', async response => {
        if (response.url().endsWith("/index.php")) {
            console.log("response code: ", response.status());
            s = response;
        }
    });
    await page.select("#rec_dur", "9999");
    let p = await s.text();
    let $ = cheerio.load(p);
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


async function main() {
    let browser = await puppeteer.launch();
    let page = (await browser.pages())[0];
    await page.goto(courseUrl);
    let elem = await page.$("#term_dropdown>option[selected='selected']")
    let [quarterStr, quarterNum] = await page.evaluate(el => [el.textContent, el.value], elem);
    let [year, quarterName, _] = quarterStr.split(" ");
    // let classes = await GetClasses(page);
    await page.goto(datesUrl);
    let html = await page.evaluate(() => document.body.innerHTML);

    let $ = cheerio.load(html, {
        decodeEntities: false
    });
    let quarterStrRegex = new RegExp(`([A-Z]+) ([A-Z]+) (\\d+)`, "gi");
    let holidayRegex = /holiday/gi;
    let trSelect = $("#main tbody>tr");
    let quarters = {};
    trSelect.each((i, elem) => {
        let elemStr = $(elem).text();
        let tokens = quarterStrRegex.exec(elemStr);
        if (tokens) {
            let quarter = {};
            quarter.name = elemStr.trim();
            for (let index = i + 1; index < Math.min(i + 7, trSelect.length); index++) {
                const element = trSelect.get(index);

                let node = $(element);
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
    });
    console.log(JSON.stringify(quarters, null, 2));

    await browser.close();
}


try {
    main();

} catch (error) {
    console.log(error);

}