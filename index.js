const puppeteer = require("puppeteer");
const express = require("express");

const server = express();
const port = 3000;

server.listen(port, "0.0.0.0", () => {
  console.log(`Servidor rodando`);
});

server.get("/bazar", async (req, res) => {
  const pageNumber = req.query.pageNumber;
  const worldName = req.query.worldName;
  const vocation = req.query.vocation;
  const skill = req.query.skill;
  const url = `https://www.tibia.com/charactertrade/?subtopic=currentcharactertrades&currentpage=${pageNumber}&filter_world=${worldName}&filter_profession=${vocation}&filter_skillid=${skill}`;
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url);

  const pageContent = await page.evaluate(() => {
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
  // console.log(JSON.stringify(pageContent, null, 2));
  res.send(pageContent);
});

server.get("/bazar/character-details", async (req, res) => {
  const auctionId = req.query.auctionId;
  const url = `https://www.tibia.com/charactertrade/?subtopic=currentcharactertrades&page=details&auctionid=${auctionId}`;
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url);

  const pageContent = await page.evaluate(() => {
    const detailsList = [];
    const skillsLabelColumns = document.querySelectorAll("td.LabelColumn");
    const skillsLevelColumns = document.querySelectorAll("td.LevelColumn");
    const baseInfoLabel = document.querySelectorAll("span.LabelV");
    const charmsLabel = document.querySelectorAll("tr.Odd > span");

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

    // charmsLabel.forEach((e, i) => {
    //   const charm = {
    //     label: e.textContent,
    //   };
    //   detailsList.push(charm);
    // });

    return detailsList;
  });

  await browser.close();
  // console.log(JSON.stringify(pageContent, null, 2));
  res.send(pageContent);
});

server.get("/history", async (req, res) => {
  const pageNumber = req.query.pageNumber;
  const worldName = req.query.worldName;
  const vocation = req.query.vocation;
  const skill = req.query.skill;
  const url = `https://www.tibia.com/charactertrade/?subtopic=pastcharactertrades&currentpage=${pageNumber}&filter_world=${worldName}&filter_profession=${vocation}&filter_skillid=${skill}`;
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url);

  const pageContent = await page.evaluate(() => {
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
  // console.log(JSON.stringify(pageContent, null, 2));
  res.send(pageContent);
});
