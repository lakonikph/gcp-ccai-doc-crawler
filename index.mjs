import puppeteer from "puppeteer";
import { convert } from "html-to-text";

(async () => {
  // -----------------------------------------------------------
  // Open Browser
  // -----------------------------------------------------------
  const browser = await puppeteer.launch({ headless: true, args: ["--window-size=1920,1080"] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  // Set screen size

  // -----------------------------------------------------------
  // Navigate to Home URL
  // -----------------------------------------------------------
  await page.goto("https://cloud.google.com/contact-center/ccai-platform/docs");
  const siteTitleElement = await page.waitForSelector(".devsite-page-title");
  const siteTitleText = await siteTitleElement?.evaluate((el) => el.textContent);
  if (siteTitleText !== "CCAI Platform") {
    console.info("Unexpected Site.");
    await browser.close();
  }

  // -----------------------------------------------------------
  // Getll All URLs
  // -----------------------------------------------------------
  const navigationLinkElements = await page.$$("ul.devsite-nav-list[menu=_book] a", (a) => a);
  const links = (
    await Promise.all(
      navigationLinkElements.map(async (a) => {
        return await page.evaluate((link) => {
          return {
            link: "https://cloud.google.com" + link.getAttribute("href"),
            text: link.textContent,
          };
        }, a);
      })
    )
  ).filter((link) => link.text !== "");

  // -----------------------------------------------------------
  // Visit Each URL
  // -----------------------------------------------------------
  for (const link in links) {
    const current = links[link];

    console.log(`Processing Pages ${parseInt(link) + 1} / ${links.length}: ${current.link}`);
    await page.goto(current.link);
    const siteArticleElement = await page.waitForSelector(".devsite-article-body");
    const siteArticleElementText = await siteArticleElement?.evaluate((el) => el.outerHTML);
    const textContent = convert(siteArticleElementText);

    const data = {
      link: current.link,
      title: current.text,
      content: textContent,
      time: +new Date(),
    };

    console.log(JSON.stringify(data, null, 2));
    break;
  }

  // https://stackoverflow.com/questions/76693754/typescript-console-lines-are-not-cleared-properly
  // https://www.npmjs.com/package/chalk

  // for (const navigationLinkElement of navigationLinkElements) {
  //   const href = await page.evaluate(
  //     (anchor) => anchor.getAttribute("href"),
  //     navigationLinkElement
  //   );
  // }

  // // Type into search box
  // await page.type(".devsite-search-field", "automate beyond recorder");

  // // Wait and click on first result
  // const searchResultSelector = ".devsite-result-item-link";

  // await page.click(searchResultSelector);

  // // Locate the full title with a unique string
  // const textSelector = await page.waitForSelector("text/Customize and automate");
  // const fullTitle = await textSelector?.evaluate((el) => el.textContent);

  // // Print the full title
  // console.log('The title of this blog post is "%s".', fullTitle);

  // await browser.close();
})();
