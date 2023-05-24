import { Login } from "../Login"
import { Signup } from "../Signup"
import { ItemList } from "../ItemList"
import { SearchBar } from "../SearchBar"
import { useCookies } from "react-cookie"
import { MerComponent } from "../MerComponent"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import { fetcher } from "../../helper"
import "react-toastify/dist/ReactToastify.css"

interface Item {
  id: number
  name: string
  price: number
  category_name: string
}
export const Home = () => {
  const [cookies] = useCookies(["userID", "token"])
  const [items, setItems] = useState<Item[]>([])

  const [searchValue, setSearchValue] = useState<string>("")

  const handleSearch = (value: string) => {
    setSearchValue(value)

    const searchEndpoint = `/search?keyword=${value}`

    searchItems(searchEndpoint)
  }

  const fetchItems = () => {
    fetcher<Item[]>(`/items`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })
      .then((data) => {
        console.log("GET success:", data)
        setItems(data)
      })
      .catch((err) => {
        console.log(`GET error:`, err)
        toast.error(err.message)
      })
  }

  const searchItems = (searchEndpoint: string) => {
    fetcher<Item[]>(searchEndpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })
      .then((data) => {
        console.log("Search success:")
        setItems(data)
      })
      .catch((err) => {
        console.log(`GET error:`, err)
        toast.error(err.message)
      })
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const [isLogInPage, setIsLogInPage] = useState(true)

  const toggleIsLogInPage = () => {
    setIsLogInPage(!isLogInPage)
  }

  const signUpAndSignInPage = (
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

  const itemListPage = (
    <MerComponent>
      <div className="ItemListPage">
        <span>
          <p>Logined User ID: {cookies.userID}</p>
        </span>
        <SearchBar onSearch={handleSearch} />
        <p>Showing search results for: {searchValue}</p>
        <ItemList items={items} />
      </div>
    </MerComponent>
  )

  return <>{cookies.token ? itemListPage : signUpAndSignInPage}</>
}
