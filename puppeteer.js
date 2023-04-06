const puppeteer = require("puppeteer");

let browser;
let page;

async function initBrowser() {
  if (!browser) {
    browser = await puppeteer.launch({ headless: true });
    page = await browser.newPage();
  }
}

async function getBazar(
  pageNumber,
  worldName,
  vocation,
  order_column,
  order_direction
) {
  const url = `https://www.tibia.com/charactertrade/?subtopic=currentcharactertrades&currentpage=${pageNumber}&filter_world=${worldName}&filter_profession=${vocation}&order_column=${order_column}&order_direction=${order_direction}`;
  await initBrowser();
  await page.goto(url);

  const pageContent = await page.evaluate(() => {
    const auctions = [];

    function extractValueFromString(string, keyword) {
      const regex = new RegExp(`${keyword}\\s*:\\s*([\\w\\s]+)`);
      const match = string.match(regex);
      return match ? match[1].trim() : null;
    }

    function findAuctionId(value) {
      var index = value.indexOf("auctionid=");
      var startIndex = index + "auctionid=".length;
      var endIndex = value.indexOf("&", startIndex);
      var auctionId = value.substring(startIndex, endIndex);
      return auctionId;
    }

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

  return pageContent;
}

async function getHistory(
  pageNumber,
  worldName,
  vocation,
  order_column,
  order_direction
) {
  const url = `https://www.tibia.com/charactertrade/?subtopic=pastcharactertrades&currentpage=${pageNumber}&filter_world=${worldName}&filter_profession=${vocation}&order_column=${order_column}&order_direction=${order_direction}`;
  await initBrowser();
  await page.goto(url);

  const pageContent = await page.evaluate(() => {
    const auctions = [];

    function extractValueFromString(string, keyword) {
      const regex = new RegExp(`${keyword}\\s*:\\s*([\\w\\s]+)`);
      const match = string.match(regex);
      return match ? match[1].trim() : null;
    }

    function findAuctionId(value) {
      var index = value.indexOf("auctionid=");
      var startIndex = index + "auctionid=".length;
      var endIndex = value.indexOf("&", startIndex);
      var auctionId = value.substring(startIndex, endIndex);
      return auctionId;
    }

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

  return pageContent;
}

async function getCharacterDetails(auctionId) {
  const url = `https://www.tibia.com/charactertrade/?subtopic=currentcharactertrades&page=details&auctionid=${auctionId}`;
  await initBrowser();
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

  return pageContent;
}

module.exports = { getBazar, getCharacterDetails, getHistory };
