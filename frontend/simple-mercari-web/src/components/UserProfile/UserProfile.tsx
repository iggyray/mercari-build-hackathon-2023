import { useState, useEffect } from "react"
import { useCookies } from "react-cookie"
import { useParams } from "react-router-dom"
import { MerComponent } from "../MerComponent"
import { toast } from "react-toastify"
import { ItemList } from "../ItemList"
import { fetcher } from "../../helper"

interface Item {
  id: number
  name: string
  price: number
  category_name: string
  status: number
}

export const UserProfile: React.FC = () => {
  const [items, setItems] = useState<Item[]>([])
  const [balance, setBalance] = useState<number>()
  const [addedbalance, setAddedBalance] = useState<number>()
  const [cookies] = useCookies(["token", "userName"])
  const params = useParams()

  const fetchItems = () => {
    fetcher<Item[]>(`/users/${params.id}/items`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${cookies.token}`,
      },
    })
      .then((items) => setItems(items))
      .catch((err) => {
        console.log(`GET error:`, err)
        toast.error(err.message)
      })
  }

  const fetchUserBalance = () => {
    fetcher<{ balance: number }>(`/balance`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${cookies.token}`,
      },
    })
      .then((res) => {
        setBalance(res.balance)
      })
      .catch((err) => {
        console.log(`GET error:`, err)
        toast.error(err.message)
      })
  }

  useEffect(() => {
    fetchItems()
    fetchUserBalance()
  }, [])

  const onBalanceSubmit = () => {
    fetcher(`/balance`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookies.token}`,
      },
      body: JSON.stringify({
        balance: addedbalance,
      }),
    })
      .then((_) => {
        toast.success(`New balance added!`)
        window.location.reload()
      })
      .catch(async (err) => {
        const { message } = await err.json()
        console.log(`POST error:`, err)

        toast.error(message || "An error occurred")
      })
  }

  return (
    <MerComponent>
      <div className="UserProfile">
        <div className="ProfileBanner">
          <div>
            <h1 className="display-3">{cookies.userName}</h1>
            <h5>Balance: {balance}</h5>
          </div>
          <div>
            <input
              type="number"
              min={0}
              name="balance"
              placeholder="0"
              className="form-control"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setAddedBalance(Number(e.target.value))
              }}
              required
            />
            <button onClick={onBalanceSubmit} id="MerButton">
              Add balance
            </button>
          </div>
        </div>

        <div className="ProfilePageItems">
          <h2>Item List</h2>
          {<ItemList items={items} />}
        </div>
      </div>
    </MerComponent>
  )
}
