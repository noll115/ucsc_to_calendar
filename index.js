const cheerio = require("cheerio");
const puppeteer = require("puppeteer");


const loginUrl = "https://my.ucsc.edu/";
const datesUrl = "https://registrar.ucsc.edu/calendar/key-dates/index.html"


async function main() {
    const browser = await puppeteer.launch({ args: ['--disable-features=site-per-process'] });
    const page = await browser.newPage();
    await page.goto(loginUrl, { waitUntil: "networkidle0" });
    await page.type("#username", "nogomez");
    await page.type("#password", "$n0wfl@ke");
    await Promise.all([
        page.waitForNavigation(),
        page.click("[type=submit]")
    ]);
    const elem = await page.waitForSelector("#duo_iframe");
    const frame = await elem.contentFrame();
    console.log("Getting Auth");

    await Promise.all([
        frame.click("button.auth-button.positive"),
        page.waitForNavigation({ timeout: 0, waitUntil: "networkidle0" })
    ]);
    console.log("Got Auth");

    await Promise.all([
        page.click("#shibSubmit"),
        page.waitForNavigation({ waitUntil: "networkidle0" })
    ]);
    console.log("Obtaining Classes");
    await Promise.all([
        page.goto("https://my.ucsc.edu/psc/csprd_newwin/EMPLOYEE/SA/c/NUI_FRAMEWORK.PT_AGSTARTPAGE_NUI.GBL?CONTEXTIDPARAMS=TEMPLATE_ID%3aPTPPNAVCOL&scname=ADMN_ENROLLMENT&PTPPB_GROUPLET_ID=SCX_ENROLLMENT&CRefName=ADMN_NAVCOLL_4&PanelCollapsible=Y&AJAXTransfer=Y"),
        page.waitForNavigation({ waitUntil: "networkidle0" })
    ]);
    const enrollmentFrame = await (await page.waitForSelector(`[id='main_target_win5']`)).contentFrame();
    await enrollmentFrame.waitForNavigation();


    const $ = cheerio.load(await enrollmentFrame.content());
    const table = $("[id='ACE_STDNT_ENRL_SSV2$0']>tbody>tr table.PSGROUPBOXWBO>tbody");
    let classes = [];
    let quaterStr = $("[id='DERIVED_REGFRM1_SSR_STDNTKEY_DESCR$11$']").text();
    let [year, quarter, _] = quaterStr.split(" ");
    console.log(`${quarter} ${year}`);

    table.each((i, elem) => {
        let className = $(elem).children("tr").children("td").first().text();
        let status = $(`[id='STATUS$${i}']`).text();
        if (status == "Dropped") return true;

        console.log(`Class name: ${className}`);
        let classIndex = i * 2;
        let lectTime = $(`[id='MTG_SCHED$${classIndex}']`).text();
        let sectionTime = $(`[id='MTG_SCHED$${classIndex + 1}']`).text();
        let lectLoc = $(`[id='MTG_LOC$${classIndex}']`).text();
        let sectionLoc = $(`[id='MTG_LOC$${classIndex + 1}']`).text();
        console.log("------Lecture------");
        console.log(`Location: ${lectLoc}  |  Time: ${lectTime}`);
        console.log("------Section------");
        console.log(`Location: ${sectionLoc}  |  Time: ${sectionTime}`);
        console.log();

        let classData = {
            className,
            lectTime,
            lectLoc,
            sectionTime,
            sectionLoc
        };
        classes.push(classData);


    })
    console.log("DONE");
    // await page.click("#auth_methods [data-device-index=phone1] div.push-label");
}


try {
    main();

} catch (error) {
    console.log(error);

}