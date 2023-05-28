import { useState, useEffect } from "react"
import { useCookies } from "react-cookie"
import { useNavigate } from "react-router-dom"
import { fetcherBlob } from "../../helper"

interface Item {
  id: number
  name: string
  price: number
  category_name: string
  status: number
}

export const Item: React.FC<{ item: Item }> = ({ item }) => {
  const navigate = useNavigate()
  const [itemImage, setItemImage] = useState<string>("")
  const [cookies] = useCookies(["token"])

  async function getItemImage(itemId: number): Promise<Blob> {
    return await fetcherBlob(`/items/${itemId}/image`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${cookies.token}`,
      },
    })
  }

  useEffect(() => {
    async function fetchData() {
      const image = await getItemImage(item.id)
      setItemImage(URL.createObjectURL(image))
    }

    fetchData()
  }, [item])

  return (
    <div className="ItemContainer" onClick={() => navigate(`/item/${item.id}`)}>
      <div className="ImgContainer">
        <img src={itemImage} alt={item.name} />
        <div className="PriceTag">
          <p className="h6">¥ {item.price}</p>
        </div>
      </div>
      <div className="ItemTitle">
        {item.status === 3 && (
          <button
            type="button"
            id="SoldOut"
            className="btn btn-outline-danger  btn-sm"
          >
            Sold
          </button>
        )}
        <p className="h6">{item.name}</p>
      </div>
    </div>
  )
}
