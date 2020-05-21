"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const helper_functions_1 = require("./helper-functions");
function Init(courseURL, keyDatesURL) {
    function ObtainCurrentQuarters() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let { data: coursePageHTML } = yield axios_1.default({
                method: "GET",
                url: courseURL
            });
            let page = cheerio.load(coursePageHTML);
            let quarters = {};
            for (let i = 1; i < 3; i++) {
                let quarterElem = page(`#term_dropdown>option:nth-child(${i})`);
                let [year, season,] = quarterElem.text().split(" ");
                let current = ((_a = quarterElem.attr("selected")) === null || _a === void 0 ? void 0 : _a.valueOf()) !== undefined;
                let quarter = {
                    year: parseInt(year),
                    num: parseInt(quarterElem.attr("value")),
                    season: season.toLowerCase(),
                    current,
                    keyDates: null
                };
                quarters[quarter.season] = quarter;
            }
            return quarters;
        });
    }
    function SetKeyDates(currentQuarters) {
        return __awaiter(this, void 0, void 0, function* () {
            let { data: keyDatesHTML } = yield axios_1.default({
                method: "GET",
                url: keyDatesURL
            });
            let $ = cheerio.load(keyDatesHTML, {
                decodeEntities: false
            });
            let quarterStrRegex = new RegExp(`([A-Z]+) [A-Z]+ \\d+`, "i");
            let trSelect = $("#main tbody>tr").toArray();
            for (let i = 0; i < trSelect.length; i++) {
                let elemStr = $(trSelect[i]).text();
                let tokens = quarterStrRegex.exec(elemStr);
                if (tokens) {
                    let season = tokens[1].toLowerCase();
                    if (season in currentQuarters) {
                        let quarter = currentQuarters[season];
                        let keyDates = {
                            finals: [],
                            holidays: [],
                            instruction: { begins: null, ends: null },
                            quarter: { begins: null, ends: null }
                        };
                        let lastElemIndex = i + 7;
                        for (i += 1; i < Math.min(lastElemIndex, trSelect.length); i++) {
                            let node = $(trSelect[i]);
                            let title = node.children("td:nth-child(1)").text().trim().split(" ");
                            let dates = node.children("td:nth-child(2)").html().match("<p>(.+)<br>")[1].trim().split(", ");
                            let parsedDates = helper_functions_1.ParseDates(dates, quarter.year);
                            if (title.length == 1) {
                                keyDates.holidays = parsedDates;
                            }
                            else {
                                if (title.includes("Final")) {
                                    keyDates.finals = parsedDates;
                                }
                                else {
                                    keyDates[title[0].toLowerCase()][title[1].toLowerCase()] = parsedDates[0];
                                }
                            }
                        }
                        quarter.keyDates = keyDates;
                    }
                }
            }
        });
    }
    function GetQuarters() {
        return __awaiter(this, void 0, void 0, function* () {
            let currentQuarters = yield ObtainCurrentQuarters();
            yield SetKeyDates(currentQuarters);
            return currentQuarters;
        });
    }
    return GetQuarters;
}
exports.default = Init;
//# sourceMappingURL=quarter.js.map