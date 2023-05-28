import React, { useState } from "react"
import { Routes, Route, BrowserRouter } from "react-router-dom"
import { Home } from "./components/Home"
import { Item, ItemDetail } from "./components/ItemDetail"
import { UserProfile } from "./components/UserProfile"
import { Listing } from "./components/Listing"
import "./App.css"
import { Header } from "./components/Header/Header"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { SignUpAndSignIn } from "./components/SignInSignUp"

export const App: React.FC = () => {
  const [searchValue, setSearchValue] = useState<string>("")
  const handleSearch = (value: string) => {
    setSearchValue(value)
  }

  const [itemValue, setItemValue] = useState<Item | undefined>()
  const handleItem = (item: Item | undefined) => {
    setItemValue(item)
  }
  const handleItemReset = () => {
    setItemValue(undefined)
  }

  return (
    <>
      <ToastContainer position="bottom-center" />

      <BrowserRouter>
        <div className="MerComponent">
          <Header
            onSearch={handleSearch}
            onResetItemState={handleItemReset}
          ></Header>
          <Routes>
            <Route index element={<Home searchValue={searchValue} />} />
            <Route
              path="/item/:id"
              element={<ItemDetail onUpdateItem={handleItem} />}
            />
            <Route path="/user/:id" element={<UserProfile />} />
            <Route
              path="/sell"
              element={
                <Listing
                  itemValue={itemValue}
                  onResetItemState={handleItemReset}
                />
              }
            />
            <Route path="/login" element={<SignUpAndSignIn />} />
          </Routes>
        </div>
      </BrowserRouter>
    </>
  )
}
