import * as cheerio from "cheerio";

export async function fetchTitle(url: string): Promise<string> {
  try {
    const fetchHtml = await (await fetch(url)).text();
    const $ = cheerio.load(fetchHtml);
    const title = $("head > title").text();
    return title || url;
  } catch (e) {
    return url;
  }
}
