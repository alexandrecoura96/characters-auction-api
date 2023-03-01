const puppeteer = require("puppeteer");
const express = require("express");

const server = express();
const port = 3000;

server.listen(port, "0.0.0.0", () => {
  console.log(`Servidor rodando`);
});

server.get("/bazar", async (req, res) => {
  const url = `https://www.tibia.com/charactertrade/?subtopic=currentcharactertrades`;
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);

  const pageContent = await page.evaluate(() => {
    function extractValueFromString(string, keyword) {
      const regex = new RegExp(`${keyword}\\s*:\\s*([\\w\\s]+)`);
      const match = string.match(regex);
      return match ? match[1].trim() : null;
    }

    const auctions = [];

    const auctionElements = document.querySelectorAll("div.Auction");
    auctionElements.forEach((auctionElement) => {
      const auction = {
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
      };
      auctions.push(auction);
    });

    return auctions;
  });

  await browser.close();

  res.send(pageContent);
});
