require('dotenv').config()

let PORT = process.env.PORT

const MONGODB_URI =
  process.env.NODE_ENV === 'test' // Jos moodi on testi, käytetään testitietokantaa
    ? process.env.TEST_MONGODB_URI
    : process.env.MONGODB_URI

module.exports = {
  MONGODB_URI,
  PORT,
}