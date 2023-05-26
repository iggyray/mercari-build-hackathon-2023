import React, { useState } from "react"
import { Login } from "../Login/Login"
import { Signup } from "../Signup/Signup"

export const SignUpAndSignIn: React.FC = () => {
  const [isLogInPage, setIsLogInPage] = useState(true)
  const toggleIsLogInPage = () => {
    setIsLogInPage(!isLogInPage)
  }

  return (
    <>
      {!isLogInPage && (
        <div>
          <Signup toggleLogIn={toggleIsLogInPage} />
          <button
            className="btn btn-outline-danger button"
            onClick={toggleIsLogInPage}
          >
            Log In Instead
          </button>
        </div>
      )}
      {isLogInPage && (
        <div>
          <Login />
          <button
            className="btn btn-outline-danger button"
            onClick={toggleIsLogInPage}
          >
            Sign Up Instead
          </button>
        </div>
      )}
    </>
  )
}
