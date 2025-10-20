// generate-hash.js
const bcrypt = require("bcryptjs");
const pwd = process.argv[2] || "Admin@123";
const saltRounds = 10;
const hash = bcrypt.hashSync(pwd, saltRounds);
console.log(hash);
