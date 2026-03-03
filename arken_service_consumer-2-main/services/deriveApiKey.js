import { ClobClient } from "@polymarket/clob-client";
import { Wallet } from "ethers";

const HOST = "https://clob.polymarket.com";
const CHAIN_ID = 137; // Polygon

const PRIVATE_KEY = '0x8d03a8d0dd2f59ad8fd26ea36fa55e5c32f980dd271b4e823cf68e192129c7f8';

console.log(PRIVATE_KEY,'PRIVATE_KEY==')

async function derive() {
  const wallet = new Wallet(PRIVATE_KEY);
  const client = new ClobClient(HOST, CHAIN_ID, wallet);

  const apiKey = await client.deriveApiKey();
  console.log("SAVE THIS SAFELY 👇");
  console.log(apiKey);
}

derive();