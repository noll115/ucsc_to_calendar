import { day } from "ical-generator";

const TBA = "TBA";
const iCalDates: day[] = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];
const UCSCDates = ["M", "Tu", "W", "Th", "F", "Sa"];

interface Meeting {
    days: day[],
    start: string,
    end: string,
    loc: string
};

interface Lab {
    num: number,
    sect: string,
    meet: Meeting | typeof TBA,
};

interface Labs {
    [index: number]: Lab,
    type: string
};

interface Course {
    course: string,
    section: string,
    title: string,
    num: number,
    meets: Meeting[] | typeof TBA,
    labs: Labs | null
};


interface Courses {
    [index: number]: Course
};

export { Courses, Course, Labs, Lab, Meeting, TBA, iCalDates, UCSCDates };