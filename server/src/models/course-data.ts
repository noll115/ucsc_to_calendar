import { day } from "ical-generator";

const TBA = "TBA";
const iCalDates: day[] = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
const UCSCDates = ["Su", "M", "Tu", "W", "Th", "F", "Sa"];

interface Meeting {
    days: day[],
    start: Date,
    end: Date,
    loc: string
};

interface Lab {
    id: number,
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
    type: string,
    id: number,
    instructor: string,
    meets: Meeting[] | typeof TBA,
    labs: Labs | null
};


interface Courses {
    [index: number]: Course
};

interface CourseCatalogue { [index: string]: { [index: string]: number } }

export { CourseCatalogue, Courses, Course, Labs, Lab, Meeting, TBA, iCalDates, UCSCDates };