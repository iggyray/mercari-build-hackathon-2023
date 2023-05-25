import { ItemList } from "../ItemList"
import { useCookies } from "react-cookie"
import { MerComponent } from "../MerComponent"
import { ChangeEvent, useEffect, useState } from "react"
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

type ShowItem = "showAll" | "showSold" | "showUnsold"

export const Home = (props: HomeComponentProps) => {
  const [cookies] = useCookies(["userID", "userName", "token"])
  const [items, setItems] = useState<Item[]>([])
  const [allItemsReference, setAllItemsReference] = useState<Item[]>([])
  const [itemFilter, setItemFilter] = useState<ShowItem>("showAll")

  const handleSearch = (value: string) => {
    const searchEndpoint = `/search?name=${value}`

    searchItems(searchEndpoint)
  }

  const handleItemFilterChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value as ShowItem
    setItemFilter(value)
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
        setAllItemsReference(data)
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
        setAllItemsReference(data)
      })
      .catch((err) => {
        toast.error(err.message)
      })
  }

  const filterItems = (itemFilter: ShowItem, items: Item[]) => {
    const localItems = items
    switch (itemFilter) {
      case "showAll":
        setItems(localItems)
        break
      case "showUnsold":
        setItems(localItems.filter((item) => item.status === 2))
        console.log(localItems)
        break
      case "showSold":
        setItems(localItems.filter((item) => item.status === 3))
        console.log(localItems)
        break
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  useEffect(() => {
    filterItems(itemFilter, allItemsReference)
  }, [itemFilter, allItemsReference])

  useEffect(() => {
    handleSearch(props.searchValue)
  }, [props.searchValue])

  const itemListPage = (
    <MerComponent>
      <div className="ItemListPage">
        {cookies.token || cookies.userID ? (
          <span>
            <p>Logined User: {cookies.userName}</p>
          </span>
        ) : null}
        {props.searchValue ? (
          <p>Showing search results for: {props.searchValue}</p>
        ) : null}
        <select
          className="form-control ItemFilter"
          onChange={handleItemFilterChange}
        >
          <option value="showAll">Show all</option>
          <option value="showUnsold">Show Unsold Only</option>
          <option value="showSold">Show Sold Only</option>
        </select>
        <ItemList items={items} />
      </div>
    </MerComponent>
  )

  return <>{itemListPage}</>
}
