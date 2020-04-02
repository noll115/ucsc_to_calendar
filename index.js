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
        elem.value = 9999;
    }, elem);
    let s;
     page.on('response', async response => {
        if (response.url().endsWith("/index.php")){
            console.log("response code: ", response.status());
            s = response;
        }
      });
    await page.select("#rec_dur", "9999");
    let p = await s.text();
    let $ = cheerio.load(p);
    let classes ={};
    $("[id^='rowpanel']").each((i,elem)=>{
        let className = $("[id^='class_id_']",elem).text();
        let classNum = $("[id^='class_nbr_']",elem).text();
        let t = $("div.panel-body>div.row div:nth-child(3)",elem).text().trim();
        console.log(t);
        
    })



}


try {
 main();

} catch (error) {
    console.log(error);

}