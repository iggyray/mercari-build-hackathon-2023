import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useCookies } from "react-cookie"
import { MerComponent } from "../MerComponent"
import { toast } from "react-toastify"
import { fetcher, fetcherBlob } from "../../helper"

const ItemStatus = {
  ItemStatusInitial: 1,
  ItemStatusOnSale: 2,
  ItemStatusSoldOut: 3,
} as const

type ItemStatus = (typeof ItemStatus)[keyof typeof ItemStatus]

interface Item {
  id: number
  name: string
  category_id: number
  category_name: string
  user_id: number
  price: number
  status: ItemStatus
  description: string
}

export const ItemDetail = () => {
  const navigate = useNavigate()
  const params = useParams()
  const [item, setItem] = useState<Item>()
  const [itemImage, setItemImage] = useState<Blob>()
  const [cookies] = useCookies(["token", "userID"])

  const fetchItem = () => {
    fetcher<Item>(`/items/${params.id}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        console.log("GET success:", res)
        setItem(res)
      })
      .catch((err) => {
        console.log(`GET error:`, err)
        toast.error(err.message)
      })

    fetcherBlob(`/items/${params.id}/image`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        console.log("GET success:", res)
        setItemImage(res)
      })
      .catch((err) => {
        console.log(`GET error:`, err)
        toast.error(err.message)
      })
  }

  const onSubmit = (_: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (cookies.token && cookies.userID) {
      fetcher<Item[]>(`/purchase/${params.id}`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${cookies.token}`,
        },
        body: JSON.stringify({
          user_id: Number(cookies.userID),
        }),
      })
        .then((_) => window.location.reload())
        .catch((err) => {
          console.log(`POST error:`, err)
          toast.error(err.message)
        })
    } else {
      navigate("/login")
    }
  }

  useEffect(() => {
    fetchItem()
  }, [])

  return (
    <div className="ItemDetail">
      <MerComponent condition={() => item !== undefined}>
        {item && itemImage && (
          <div className="ItemDetailWrapper">
            <img
              src={URL.createObjectURL(itemImage)}
              alt="item"
              onClick={() => navigate(`/item/${item.id}`)}
            />
            <div className="ItemDetailDesc">
              <h1 className="display-2">{item.name}</h1>
              <h4 className="ItemCategory">{item.category_name}</h4>
              <h3>¥ {item.price}</h3>
              <h4>Description:</h4>
              <p>{item.description}</p>
              {item.status == ItemStatus.ItemStatusSoldOut ? (
                <button
                  disabled={true}
                  onClick={onSubmit}
                  id="MerDisableButton"
                >
                  SoldOut
                </button>
              ) : (
                <button onClick={onSubmit} id="MerButton">
                  Purchase
                </button>
              )}
            </div>
          </div>
        )}
      </MerComponent>
    </div>
  )
}
