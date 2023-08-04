/**
 * Mbits returned.
 * @returns message and number: Mbits
 */
export async function measureAverageDownloadSpeed() {
    const images = [
        {
            i: "https://media.discordapp.net/attachments/1063526734969974907/1136708394913382511/d145e23c485c5113.png",
            s: 5.2 * 8
        },
        {
            i: "https://media.discordapp.net/attachments/1063526734969974907/1136720920526999702/illust_85762705_20230804_020259.jpg",
            s: 0.7 * 8,
        },
        {
            i: "https://media.discordapp.net/attachments/1063526734969974907/1136720934481428530/illust_61515810_20230804_020244.png",
            s: 1.14 * 8,
        }
    ];
    const times = [];
    for (const image of images) {
        times.push(await measureDownloadSpeed(image.i, image.s));
    }
    const alt = (times.reduce((prev, curr) => prev + curr)) / times.length
    return {
        message: `${alt} Mbps`,
        n: alt
    };
}

async function measureDownloadSpeed(image: string, mbits: number) {
    const startTime = process.hrtime();

    // a quiet (AFAICT) hack to avoid cache.
    await fetch(image + "?dummy=" + Date.now(), { cache: "no-store" });

    const pr = process.hrtime(startTime);
    const elapsedSeconds = parseHrtimeToMS(pr[0], pr[1]);
    return mbits / elapsedSeconds;
}
function parseHrtimeToMS(prev: number, curr: number) {
    const seconds = prev + (curr / 1e9);
    return seconds;
}