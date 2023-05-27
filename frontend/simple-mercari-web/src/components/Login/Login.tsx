import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useCookies } from "react-cookie"
import { toast } from "react-toastify"
import { fetcher } from "../../helper"

export const Login = () => {
  const [userName, setUserName] = useState<string>()
  const [password, setPassword] = useState<string>()
  const [_, setCookie] = useCookies(["userID", "userName", "token"])

  const navigate = useNavigate()

  const onSubmit = (_: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    fetcher<{ id: number; name: string; token: string }>(`/loginv2`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_name: userName,
        password: password,
      }),
    })
      .then((user) => {
        toast.success(`Welcome back ${user.name}!`)
        console.log("POST success:", user.name)
        setCookie("userID", user.id)
        setCookie("userName", user.name)
        setCookie("token", user.token)
        navigate("/")
      })
      .catch((err) => {
        console.log(`POST error:`, err)
        toast.error(err.message)
      })
  }

  return (
    <div>
      <div className="Login">
        <h1>Log In</h1>
        <label id="MerInputLabel">User Name</label>
        <input
          type="text"
          name="userName"
          className="form-control"
          id="MerTextInput"
          placeholder="name"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setUserName(e.target.value)
          }}
          required
        />
        <label id="MerInputLabel">Password</label>
        <input
          type="password"
          name="password"
          className="form-control"
          id="MerTextInput"
          placeholder="password"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setPassword(e.target.value)
          }}
        />
        <button onClick={onSubmit} id="MerButton">
          Login
        </button>
      </div>
    </div>
  )
}
