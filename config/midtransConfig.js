require('dotenv').config();
const midtransClient = require("midtrans-client");


const snap = new midtransClient.Snap({
  isProduction: false, // Ubah ke true jika production

  //testing key
  serverKey: process.env.SERVERKEY,
  clientKey: process.env.CLIENTKEY,
  //prod
  //serverKey: process.env.SERVERKEYPROD,
  //clientKey: process.env.CLIENTKEYPROD
  
});
// console.log("Server Key:", process.env.SERVERKEY);
// console.log("Client Key:", process.env.CLIENTKEY);

module.exports = snap