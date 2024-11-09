const createAccount = `
INSERT INTO users (
    id,
    firstname,
    lastname,
    username,
    emailid,
    password
) 
VALUES ($1, $2, $3, $4, $5, $6);
`;

const getUserName = `
SELECT 
  username, 
  emailid 
FROM 
  users 
WHERE 
  username = $1 
  OR emailid = $1 
  OR username = $2 
  OR emailid = $2;
`;

module.exports = {
  createAccount,
  getUserName,
};
