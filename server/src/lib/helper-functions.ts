
import { KeyDates } from "../../../shared/types";
import { day } from "ical-generator";

const iCalDates: day[] = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
const UCSCDates = ["Su", "M", "Tu", "W", "Th", "F", "Sa"];


function UCSCToIcalDays(daysStr: string): day[] {
    let days: day[] = [];
    UCSCDates.forEach((day, i) => {
        if (daysStr.includes(day))
            days.push(iCalDates[i]);
    });
    return days;
}

function LocalTo24Hrs(local: string) {
    let timeRegex = new RegExp(/(\d+):(\d+)\s*((?:a|p)\.*m\.*)/i);
    let [, hours, minutes, period] = timeRegex.exec(local);
    if (period === "PM" || period === "p.m.") {
        hours = (parseInt(hours) + 12).toString();
    }
    return `${hours}:${minutes}`;
}

function GetFirstMeeting({ instruction }: KeyDates, timeSlot: String, firstMeetingDay: day): Date[] {
    let dayChosen = iCalDates.indexOf(firstMeetingDay);
    let [startTimeSlot, endTimeSlot] = timeSlot.split("-").map(time => LocalTo24Hrs(time));
    let [startHr, startMin] = startTimeSlot.split(":").map(str => parseInt(str));
    let [endHr, endMin] = endTimeSlot.split(":").map(str => parseInt(str));
    // day is in range 0 Sunday to 6 Saturday
    let meetingDate = null;
    for (let i = 0; i < 8; i++) {
        let begins: Date = instruction.begins as Date;
        let newDay = begins.getDay() + i
        if (newDay % 7 == dayChosen) {
            meetingDate = new Date(begins.getFullYear(), begins.getMonth(), begins.getDate() + i)
            break;
        }
    }
    return [
        new Date(meetingDate.getFullYear(), meetingDate.getMonth(), meetingDate.getDate(), startHr, startMin),
        new Date(meetingDate.getFullYear(), meetingDate.getMonth(), meetingDate.getDate(), endHr, endMin)
    ];
}

function ParseDates(days: string[], year: number): Date[] {
    let result: Date[] = [];
    const inDateFormat = new RegExp(/[A-Z]+ \d+/i);
    const isNum = new RegExp(/^\d+$/);
    days.forEach((day, i) => {

        // if ["December 09-13"]
        if (day.includes("–")) {
            let [month, dates] = day.split(" ");
            let [from, to] = dates.split("–").map(num => Number(num));
            for (let i = from; i < to; i++) {
                result.push(new Date(`${month} ${i} ${year}`));
            }
        }
        // if ["December 09","3","4"]
        else if (inDateFormat.test(day) && isNum.test(days[i + 1])) {
            let [month, dateNum] = day.split(" ");
            result.push(new Date(`${month} ${dateNum} ${year}`));
            let index = i + 1;
            let currStr = days[index];
            while (isNum.test(currStr)) {
                result.push(new Date(`${month} ${currStr} ${year}`));
                currStr = days[++index]
            }
        } else if (inDateFormat.test(day)) {
            result.push(new Date(`${day} ${year}`))
        }
    })
    return result;
}

export { ParseDates, GetFirstMeeting, LocalTo24Hrs, UCSCToIcalDays }