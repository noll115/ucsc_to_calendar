const cheerio = require("cheerio");
const puppeteer = require("puppeteer");
const axios = require("axios").default;


const datesUrl = "https://registrar.ucsc.edu/calendar/key-dates/index.html";
const courseUrl = "https://pisa.ucsc.edu/class_search/index.php";







async function main() {
    let browser = await puppeteer.launch({ headless: false });
    let [page, _] = await browser.pages();
    await page.goto(courseUrl);
    await page.select("#reg_status", "all");
    await page.click("input[type='submit']");
    let elem = await page.waitForSelector("[id='rec_dur']>[value='100']");
    await page.evaluate((elem) => {
        elem.value = 10;
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
    await page.close();

    console.log(classes);
    
}


try {
    main();

} catch (error) {
    console.log(error);

}