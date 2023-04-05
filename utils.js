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

module.exports = { extractValueFromString, findAuctionId };
