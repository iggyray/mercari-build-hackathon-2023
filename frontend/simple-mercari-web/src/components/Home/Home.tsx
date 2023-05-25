import { Login } from "../Login"
import { Signup } from "../Signup"
import { ItemList } from "../ItemList"
import { useCookies } from "react-cookie"
import { MerComponent } from "../MerComponent"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import { fetcher } from "../../helper"
import "react-toastify/dist/ReactToastify.css"
import { useSearchBar } from "../../common/provider"

interface Item {
  id: number
  name: string
  price: number
  category_name: string
}
export const Home = () => {
  const [cookies] = useCookies(["userID", "token"])
  const [items, setItems] = useState<Item[]>([])

  const searchValue = useSearchBar(state => state.searchValue)



  const searchEndpoint = `/search?keyword=${searchValue}`




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
    searchItems(searchEndpoint)
  }, [])




  const itemListPage = (
    <MerComponent>
      <div className="ItemListPage">
        {cookies.token ||
          cookies.userID ? <span>
          <p>Logined User ID: {cookies.userID}</p>
        </span> : null}
        {searchValue ?
          <p>Showing search results for: {searchValue}</p> : null}
        <ItemList items={items} />
      </div>
    </MerComponent>
  )

  return <>{itemListPage}</>
}
