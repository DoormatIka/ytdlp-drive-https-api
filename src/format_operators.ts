import { FORMAT_TYPE } from "./types/format";

export function mergeFormats(...format: (FORMAT_TYPE | string)[]) {
    // equivalent to combining different formats into one
    // usage: mergeFormats("bestvideo", "worstaudio")
    return format.join("+");
}
export function formatSeperate(...format: (FORMAT_TYPE | string)[]) {
    // equivalent to separating formats into their own files
    return format.join(",");
}
export function select(format: FORMAT_TYPE, selected: number) {
    // equivalent to "ba.2" => "second best audio quality" and etc.
    // "ba.n"
    return `${format}.${selected}`;
}