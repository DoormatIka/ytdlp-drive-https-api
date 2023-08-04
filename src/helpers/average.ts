/**
 * Mbits returned.
 * @returns message and number: Mbits
 */
export async function measureAverageDownloadSpeed() {
    const images = [
        {
            i: "https://media.discordapp.net/attachments/1063526734969974907/1136912681471856731/Piss_Healerchan_Cleaned_1.png",
            s: 5.95 * 8
        },
        {
            i: "https://cdn.discordapp.com/attachments/1063526734969974907/1136918736884998234/98.png",
            s: 9.8 * 8,
        },
        {
            i: "https://cdn.discordapp.com/attachments/1063526734969974907/1136919471165014086/335037376_3429171477401305_962989575239595520_n.png",
            s: 9.4 * 8,
        }
    ];

    const speeds = [];
    const times = [];
    for (const image of images) {
        const speed = await measureDownloadSpeed(image.i, image.s);
        speeds.push(speed.mbits);
        times.push(speed.seconds);
    }
    const alt = (speeds.reduce((prev, curr) => prev + curr)) / times.length
    return {
        message: `${alt} Mbps`,
        n: alt,
        seconds: times
    };
}

async function measureDownloadSpeed(image: string, mbits: number) {
    const startTime = process.hrtime();

    // a quiet (AFAICT) hack to avoid cache.
    const res = await fetch(image + "?dummy=" + Date.now(), { cache: "no-store" });
    await res.blob()

    const pr = process.hrtime(startTime);
    const elapsedSeconds = parseHrtimeToMS(pr[0], pr[1]);
    return {
        mbits: mbits / elapsedSeconds,
        seconds: elapsedSeconds
    };
}
function parseHrtimeToMS(prev: number, curr: number) {
    const seconds = prev + (curr / 1e9);
    return seconds;
}