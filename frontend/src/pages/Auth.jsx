// module-imports
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

// components
import Login from "../components/auth/Login";
import Register from "../components/auth/Register";

function Auth() {
  const [hasAccount, setHasAccount] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const validateUser = () => {
      const authToken = Cookies.get("authToken");
      const username = Cookies.get("username");

      console.log(authToken, username);

      if (authToken && username) navigate("/");
    };

    validateUser();
  }, []);

  return (
    <>
      {hasAccount ? (
        <Login hasAccount={hasAccount} setHasAccount={setHasAccount} />
      ) : (
        <Register hasAccount={hasAccount} setHasAccount={setHasAccount} />
      )}
    </>
  );
}

export default Auth;
