import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { fetcher } from "../../helper"

interface Props {
  toggleLogIn: () => void
}

export const Signup: React.FC<Props> = ({ toggleLogIn }) => {
  const [name, setName] = useState<string>()
  const [password, setPassword] = useState<string>()

  const navigate = useNavigate()
  const onSubmit = (_: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    fetcher<{ name: string }>(`/register`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name,
        password: password,
      }),
    })
      .then((user) => {
        toast.success(`New account with name: ${user.name} has been created!`)
        console.log("POST success:", user.name)
        toggleLogIn()
      })
      .catch((err) => {
        console.log(`POST error:`, err)
        toast.error("Sign Up Failed")
      })
  }

  return (
    <div>
      <div className="Signup">
        <h1>Sign Up</h1>
        <label id="MerInputLabel">User Name</label>
        <input
          type="text"
          name="name"
          className="form-control"
          id="MerTextInput"
          placeholder="name"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setName(e.target.value)
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
          Signup
        </button>
      </div>
    </div>
  )
}
