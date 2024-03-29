const express = require("express");
const { getBazar, getCharacterDetails, getHistory } = require("./puppeteer");

const server = express();
const port = 3000;

server.listen(port, "0.0.0.0", () => {
  console.log(`Servidor rodando`);
});

server.get("/bazar", async (req, res) => {
  const pageNumber = req.query.pageNumber;
  const worldName = req.query.worldName;
  const vocation = req.query.vocation;
  const order_column = req.query.order_column;
  const order_direction = req.query.order_direction;

  const pageContent = await getBazar(
    pageNumber,
    worldName,
    vocation,
    order_column,
    order_direction
  );
  res.send(pageContent);
});

server.get("/bazar/character-details", async (req, res) => {
  const auctionId = req.query.auctionId;
  const pageContent = await getCharacterDetails(auctionId);

  res.send(pageContent);
});

server.get("/history", async (req, res) => {
  const pageNumber = req.query.pageNumber;
  const worldName = req.query.worldName;
  const vocation = req.query.vocation;
  const order_column = req.query.order_column;
  const order_direction = req.query.order_direction;

  const pageContent = await getHistory(
    pageNumber,
    worldName,
    vocation,
    order_column,
    order_direction
  );

  res.send(pageContent);
});
