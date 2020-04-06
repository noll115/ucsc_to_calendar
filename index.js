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

    let $ = cheerio.load(html,{
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
            for (let index = i + 1; index < i + 6; index++) {
                const element = trSelect.get(index);
                let node = $(element);
                let title = node.children("td:nth-child(1)").text().trim().split(" ");
                let days = node.children("td:nth-child(2)").html().match("<p>(.+)<br>")[1];

                if (title.length == 1) {
                    quarter[title[0]] = days.split(", ");
                } else {
                    quarter[title[0]] = quarter[title[0]] || {};
                    quarter[title[0]][title[1]] = days
                }
            }
            quarters[tokens[1]] = quarter;
        }
    });
    console.log(quarters);

    await browser.close();
}


try {
    main();

} catch (error) {
    console.log(error);

}