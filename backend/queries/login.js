const getAccount = `
SELECT id, password
FROM users
WHERE username = $1 OR emailid = $1;
`;

module.exports = { getAccount };
