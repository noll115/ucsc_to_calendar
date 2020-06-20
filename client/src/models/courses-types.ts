export type day = "SU" | "MO" | "TU" | "WE" | "TH" | "FR" | "SA";
export const TBA = "TBA";


export interface Meeting {
    days: day[],
    start: Date,
    end: Date,
    loc: string
};

export interface Lab {
    num: number,
    sect: string,
    meet: Meeting | typeof TBA,
};

export interface Labs {
    [index: number]: Lab,
    type: string
};

export interface Course {
    course: string,
    section: string,
    title: string,
    type: string,
    num: number,
    meets: Meeting[] | typeof TBA,
    labs: Labs | null
};


export interface Courses {
    [index: number]: Course
};