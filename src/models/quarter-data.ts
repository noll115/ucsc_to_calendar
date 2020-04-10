export interface Quarter {
    name: string;
    finals: Date[];
    holidays: Date[];
    instruction: {
        begins: Date,
        ends: Date
    };
    quarter: {
        begins: Date,
        ends: Date
    };
    [key: string]: any
}

export enum QuarterSeasons {
    fall, winter, spring, summer
}