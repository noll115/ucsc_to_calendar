"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const course_data_1 = require("../models/course-data");
function UCSCToIcalDays(daysStr) {
    let days = [];
    course_data_1.UCSCDates.forEach((day, i) => {
        if (daysStr.includes(day))
            days.push(course_data_1.iCalDates[i]);
    });
    return days;
}
exports.UCSCToIcalDays = UCSCToIcalDays;
function LocalTo24Hrs(local) {
    let timeRegex = new RegExp(/(\d{2}):(\d{2})(PM|AM)/);
    let [, hours, minutes, period] = timeRegex.exec(local);
    if (period === "PM") {
        let convHrs = parseInt(hours) + 12;
        return `${convHrs}:${minutes}`;
    }
    return `${hours}:${minutes}`;
}
exports.LocalTo24Hrs = LocalTo24Hrs;
function GetFirstMeeting({ instruction }, timeSlot, firstMeetingDay) {
    let dayChosen = course_data_1.iCalDates.indexOf(firstMeetingDay);
    let [startTimeSlot, endTimeSlot] = timeSlot.split("-").map(time => LocalTo24Hrs(time));
    let [startHr, startMin] = startTimeSlot.split(":").map(str => parseInt(str));
    let [endHr, endMin] = endTimeSlot.split(":").map(str => parseInt(str));
    // day is in range 0 Sunday to 6 Saturday
    let meetingDate = null;
    for (let i = 0; i < 8; i++) {
        let newDay = instruction.begins.getDay() + i;
        if (newDay % 7 == dayChosen) {
            meetingDate = new Date(instruction.begins.getFullYear(), instruction.begins.getMonth(), instruction.begins.getDate() + i);
            break;
        }
    }
    return [
        new Date(meetingDate.getFullYear(), meetingDate.getMonth(), meetingDate.getDate(), startHr, startMin),
        new Date(meetingDate.getFullYear(), meetingDate.getMonth(), meetingDate.getDate(), endHr, endMin)
    ];
}
exports.GetFirstMeeting = GetFirstMeeting;
function ParseDates(days, year) {
    let result = [];
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
                currStr = days[++index];
            }
        }
        else if (inDateFormat.test(day)) {
            result.push(new Date(`${day} ${year}`));
        }
    });
    return result;
}
exports.ParseDates = ParseDates;
//# sourceMappingURL=helper-functions.js.map