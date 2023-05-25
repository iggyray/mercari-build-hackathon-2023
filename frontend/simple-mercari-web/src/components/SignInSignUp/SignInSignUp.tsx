import React, { useEffect, useState } from 'react'
import { Login } from '../Login/Login'
import { Signup } from '../Signup/Signup'
import { useCookies } from "react-cookie"
import { useNavigate } from "react-router-dom";

export const SignUpAndSignIn: React.FC = () => {
    const [isLogInPage, setIsLogInPage] = useState(true)
    const [cookies] = useCookies(["userID", "token"])
    const navigate = useNavigate();
    const toggleIsLogInPage = () => {
        setIsLogInPage(!isLogInPage)
    }
    useEffect(() => {


        if (cookies.token ||
            cookies.userID) {
            navigate(`/user/${cookies.userID}`)
        }

    }, [cookies, navigate])

    return (
        <>
            {!isLogInPage && (
                <div>
                    <Signup />
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
