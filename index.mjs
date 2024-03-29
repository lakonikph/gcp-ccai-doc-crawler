import puppeteer from "puppeteer";
import { convert } from "html-to-text";
import fs from "fs/promises";

const openBrowser = async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--window-size=1920,1080"],
  });
  const page = await browser.newPage();
  // Set screen size
  await page.setViewport({ width: 1920, height: 1080 });
  return page;
};

const openPage = async (page, url, title) => {
  await page.goto(url);
  const siteTitleElement = await page.waitForSelector(".devsite-page-title");
  const siteTitleText = await siteTitleElement?.evaluate(
    (el) => el.textContent
  );
  if (siteTitleText !== title) {
    throw new Error("Unexpected Title!");
  }
};

const getLinks = async (page) => {
  const navigationLinkElements = await page.$$(
    "ul.devsite-nav-list[menu=_book] a",
    (a) => a
  );
  const links = (
    await Promise.all(
      navigationLinkElements.map(async (a) => {
        return await page.evaluate((link) => {
          return {
            link: link.getAttribute("href"),
            text: link.textContent,
          };
        }, a);
      })
    )
  )
    .filter((link) => link.text !== "" && !link.link.startsWith("https://"))
    .map((link) => {
      return { link: "https://cloud.google.com" + link.link, text: link.text };
    });
  return links;
};

const writeData = async (page, links) => {
  for (const link in links) {
    const current = links[link];

    console.log(
      `Processing Pages ${parseInt(link) + 1} / ${links.length}: ${
        current.link
      }`
    );
    await page.goto(current.link);
    const siteArticleElement = await page.waitForSelector(
      ".devsite-article-body"
    );
    const siteArticleElementText = await siteArticleElement?.evaluate(
      (el) => el.outerHTML
    );
    const textContent = convert(siteArticleElementText);

    const data = {
      link: current.link,
      title: current.text,
      content: textContent,
    };

    await fs.writeFile("data.ndjson", JSON.stringify(data) + "\n", {
      encoding: "utf8",
      flag: "a+",
    });
  }
};

(async () => {
  // -----------------------------------------------------------
  // Open Browser
  // -----------------------------------------------------------
  const page = await openBrowser();

  // -----------------------------------------------------------
  // Navigate to Home URL
  // -----------------------------------------------------------
  await openPage(
    page,
    "https://cloud.google.com/contact-center/ccai-platform/docs",
    "CCAI Platform"
  );
  // -----------------------------------------------------------
  // Getll All URLs
  // -----------------------------------------------------------
  const ccaiLinks = await getLinks(page);

  // -----------------------------------------------------------
  // Navigate to Home URL
  // -----------------------------------------------------------
  await openPage(
    page,
    "https://cloud.google.com/agent-assist/docs",
    "Agent Assist documentation"
  );

  const agentAssitLinks = (await getLinks(page)).filter(
    (link) => link.text !== "Overview"
  );

  await openPage(
    page,
    "https://cloud.google.com/dialogflow/cx/docs",
    "Dialogflow CX documentation"
  );

  const dfcxLinks = await getLinks(page);

  console.log(dfcxLinks);
  const links = [...ccaiLinks, ...agentAssitLinks, ...dfcxLinks];
  // -----------------------------------------------------------
  // Visit Each URL
  // -----------------------------------------------------------
  await writeData(page, links);
  throw new Error("Completion Crash!");
})();
