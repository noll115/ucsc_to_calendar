
interface Meeting {
    days: string[],
    time: string
};

interface Lab {
    num: number,
    sect: string,
    meet: Meeting,
    loc: string
};

interface Labs {
    [index: number]: Lab,
    type: string
};

interface Course {
    name: string,
    num: number,
    meets: Meeting[],
    loc: string,
    labs: Labs | null
};


interface Courses {
    [index: number]: Course
};

export { Courses, Course, Labs, Lab, Meeting };