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
  status: number
}
interface HomeComponentProps {
  searchValue: string
}

export const Home = (props: HomeComponentProps) => {
  const [cookies] = useCookies(["userID", "userName", "token"])
  const [items, setItems] = useState<Item[]>([])
  const [profile, setProfile] = useState<Item[]>([])

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



  const itemListPage = (
    <MerComponent>
      <div className="ItemListPage">
        {cookies.token ||
          cookies.userID ? <span>
          <p>Logined User: {cookies.userName}</p>
        </span> : null}
        {props.searchValue ?
          <p>Showing search results for: {props.searchValue}</p> : null}
        <ItemList items={items} />
      </div>
    </MerComponent>
  )

  return <>{itemListPage}</>
}
