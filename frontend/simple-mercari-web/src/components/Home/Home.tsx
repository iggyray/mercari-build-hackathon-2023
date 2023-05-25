import { Login } from "../Login"
import { Signup } from "../Signup"
import { ItemList } from "../ItemList"
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
interface HomeComponentProps {
  searchValue: string
}

export const Home = (props: HomeComponentProps) => {
  const [cookies] = useCookies(["userID", "token"])
  const [items, setItems] = useState<Item[]>([])

  const handleSearch = (value: string) => {
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
        setItems(data)
      })
      .catch((err) => {
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
        setItems(data)
      })
      .catch((err) => {
        toast.error(err.message)
      })
  }

  useEffect(() => {
    fetchItems()
  }, [])

  useEffect(() => {
    handleSearch(props.searchValue)
  }, [props.searchValue])

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
        <p>Showing search results for: {props.searchValue}</p>
        <ItemList items={items} />
      </div>
    </MerComponent>
  )

  return <>{cookies.token ? itemListPage : signUpAndSignInPage}</>
}
