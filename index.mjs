import puppeteer from "puppeteer";
import { convert } from "html-to-text";

(async () => {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({ headless: false, args: ["--window-size=1920,1080"] });
  const page = await browser.newPage();

  // Set screen size
  await page.setViewport({ width: 1920, height: 1080 });

  // Navigate the page to a URL
  await page.goto("https://cloud.google.com/contact-center/ccai-platform/docs");
  const siteTitleElement = await page.waitForSelector(".devsite-page-title");
  const siteTitleText = await siteTitleElement?.evaluate((el) => el.textContent);
  if (siteTitleText !== "CCAI Platform") {
    console.info("Unexpected Site.");
    await browser.close();
  }

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

  for (const link of links) {
    console.log("Now visiting: " + link);
    await page.goto(link.link);
    await page.waitForSelector(".devsite-page-title");
    const siteArticleElement = await page.waitForSelector(".devsite-article");
    const siteArticleElementText = await siteArticleElement?.evaluate((el) => el.outerHTML);
    console.log(convert(siteArticleElementText));
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
