import axios from "axios";

export async function getPrice(tokenId, side) {
  const { data } = await axios.get(
    `https://clob.polymarket.com/book?token_id=${tokenId}`
  );

  return side === "BUY"
    ? data.asks[0].price
    : data.bids[0].price;
}
