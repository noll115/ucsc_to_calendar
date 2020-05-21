import { promises as fsPromise } from "fs";
import finalModule from "./modules/finals";
const courseURL = "https://pisa.ucsc.edu/class_search/index.php";
const keyDatesURL = "https://registrar.ucsc.edu/calendar/key-dates/index.html";


async function main() {
    // let quarters = await GetQuarters();
    // let { num: quarterNum, year, keyDates } = quarters.spring;

    // let { instruction: { begins } } = keyDates
    // let courseToNums = await GetCourses(quarterNum, year);


    // let cal = ical({ domain: "ucsc-cal.com", name: "ucsc" });
    // let event = cal.createEvent({
    //     timezone:"America/Los_Angeles",
    //     start: startDate,
    //     summary: courseSelected.name,
    //     description: "",
    //     location: courseSelected.loc,
    //     end: endDate,
    //     repeating: {
    //         freq: "WEEKLY",
    //         exclude: keyDates.holidays,
    //         byDay: courseSelected.meets[0].days,
    //         until: ends
    //     },
    //     alarms:[],
    // });
    // console.log(cal.toJSON());

    // cal.saveSync("./cal.ics")
    await finalModule.GetFinalDates();
}


main();


