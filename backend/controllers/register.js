const pool = require("../db");
const queries = require("../queries/register");
const bcrypt = require("bcrypt");
const util = require("util");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

const saltRounds = 10;
const hashAsync = util.promisify(bcrypt.hash);

const createAccount = async (req, res) => {
  const { firstname, lastname, username, emailid, password } = req.body;

  // Validate required fields
  if (!firstname || !lastname || !username || !emailid || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Check if the username or email already exists
    const userCheck = await pool.query(queries.getUserName, [
      username,
      emailid,
    ]);
    if (userCheck.rows.length > 0) {
      return res.status(409).json({ message: "User already exists." });
    }

    // Hash the password
    const hashedPassword = await hashAsync(password, saltRounds);

    // Create a new user with a unique ID
    const userId = uuidv4();
    await pool.query(queries.createAccount, [
      userId,
      firstname,
      lastname,
      username,
      emailid,
      hashedPassword,
    ]);

    return res.status(201).json({ message: "Account created successfully." });
  } catch (error) {
    console.error("Error creating account:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = {
  createAccount,
};
