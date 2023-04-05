const puppeteer = require("puppeteer");
const { findAuctionId, extractValueFromString } = require("./utils");

async function getBazar(pageNumber, worldName, vocation, skill) {
  const url = `https://www.tibia.com/charactertrade/?subtopic=currentcharactertrades&currentpage=${pageNumber}&filter_world=${worldName}&filter_profession=${vocation}&filter_skillid=${skill}`;
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url);
  await page.exposeFunction("extractValueFromString", extractValueFromString);
  await page.exposeFunction("findAuctionId", findAuctionId);

  const pageContent = await page.evaluate(() => {
    const auctions = [];

    const auctionElements = document.querySelectorAll("div.Auction");
    auctionElements.forEach((auctionElement) => {
      const auction = {
        auctionId: findAuctionId(
          auctionElement.querySelector("div.AuctionCharacterName > a").href
        ),
        name: auctionElement.querySelector("div.AuctionCharacterName")
          .textContent,
        level: extractValueFromString(auctionElement.textContent, "Level"),
        gender: auctionElement.textContent.includes("Male") ? "Male" : "Female",
        vocation: extractValueFromString(
          auctionElement.textContent,
          "Vocation"
        ),
        world:
          auctionElement.querySelector("div.AuctionHeader").children[2]
            .textContent,
        auctionStart: auctionElement.querySelector("div.ShortAuctionDataValue")
          .textContent,
        auctionEnd: auctionElement
          .querySelector("div.AuctionTimer")
          .getAttribute("data-timestamp"),
        bid: auctionElement.querySelector("div.ShortAuctionDataValue > b")
          .textContent,
        outfitUrl: auctionElement.querySelector("img.AuctionOutfitImage").src,
        charactersFeatures: Array.from(
          auctionElement.querySelectorAll("div.Entry")
        ).map((entry) => entry.textContent.trim()),
        inProgress: auctionElement.querySelector(
          "div.ShortAuctionDataBidRow > div"
        ).textContent,
      };
      auctions.push(auction);
    });

    return auctions;
  });

  await browser.close();
  return pageContent;
}

async function getHistory(pageNumber, worldName, vocation, skill) {
  const url = `https://www.tibia.com/charactertrade/?subtopic=pastcharactertrades&currentpage=${pageNumber}&filter_world=${worldName}&filter_profession=${vocation}&filter_skillid=${skill}`;
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url);
  await page.exposeFunction("extractValueFromString", extractValueFromString);
  await page.exposeFunction("findAuctionId", findAuctionId);
  const pageContent = await page.evaluate(() => {
    const auctions = [];

    const auctionElements = document.querySelectorAll("div.Auction");
    auctionElements.forEach((auctionElement) => {
      const auction = {
        auctionId: findAuctionId(
          auctionElement.querySelector("div.AuctionCharacterName > a").href
        ),
        name: auctionElement.querySelector("div.AuctionCharacterName")
          .textContent,
        level: extractValueFromString(auctionElement.textContent, "Level"),
        gender: auctionElement.textContent.includes("Male") ? "Male" : "Female",
        vocation: extractValueFromString(
          auctionElement.textContent,
          "Vocation"
        ),
        world:
          auctionElement.querySelector("div.AuctionHeader").children[2]
            .textContent,
        auctionStart: auctionElement.querySelector("div.ShortAuctionDataValue")
          .textContent,
        auctionEnd: auctionElement
          .querySelectorAll("div.ShortAuctionDataValue")
          .item(1).textContent,
        bid: auctionElement.querySelector("div.ShortAuctionDataValue > b")
          .textContent,
        outfitUrl: auctionElement.querySelector("img.AuctionOutfitImage").src,
        charactersFeatures: Array.from(
          auctionElement.querySelectorAll("div.Entry")
        ).map((entry) => entry.textContent.trim()),
        inProgress: auctionElement.querySelector(
          "div.ShortAuctionDataBidRow > div"
        ).textContent,
        status: auctionElement.querySelector("div.AuctionInfo").textContent,
      };
      auctions.push(auction);
    });

    return auctions;
  });

  await browser.close();
  return pageContent;
}

async function getCharacterDetails(auctionId) {
  const url = `https://www.tibia.com/charactertrade/?subtopic=currentcharactertrades&page=details&auctionid=${auctionId}`;
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url);
  const pageContent = await page.evaluate(() => {
    const detailsList = [];
    const skillsLabelColumns = document.querySelectorAll("td.LabelColumn");
    const skillsLevelColumns = document.querySelectorAll("td.LevelColumn");
    const baseInfoLabel = document.querySelectorAll("span.LabelV");

    skillsLabelColumns.forEach((e, i) => {
      const skills = {
        label: e.textContent,
        content: skillsLevelColumns[i].textContent,
      };
      detailsList.push(skills);
    });

    baseInfoLabel.forEach((e, i) => {
      const base = {
        label: e.textContent,
        content: e.nextElementSibling.textContent,
      };
      detailsList.push(base);
    });

    return detailsList;
  });

  await browser.close();
  return pageContent;
}

module.exports = { getBazar, getCharacterDetails, getHistory };
