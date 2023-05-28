import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useCookies } from "react-cookie"
import { MerComponent } from "../MerComponent"
import { toast } from "react-toastify"
import { fetcher, fetcherBlob } from "../../helper"
import { CommentBoard, CommentType } from "../CommentBoard/CommentBoard"

const ItemStatus = {
  ItemStatusInitial: 1,
  ItemStatusOnSale: 2,
  ItemStatusSoldOut: 3,
} as const

type ItemStatusType = (typeof ItemStatus)[keyof typeof ItemStatus]

export interface Item {
  id: number
  name: string
  category_id: number
  category_name: string
  user_id: number
  price: number
  status: ItemStatusType
  description: string
}

type ButtonType = "purchase" | "sold" | "edit"

interface UpdateItemProps {
  onUpdateItem: (item: Item | undefined) => void
}

export const ItemDetail = ({ onUpdateItem }: UpdateItemProps) => {
  const navigate = useNavigate()
  const params = useParams()
  const [item, setItem] = useState<Item>()
  const [itemImage, setItemImage] = useState<Blob>()
  const [cookies] = useCookies(["token", "userID"])

  const handleNewComment = (comment: string) => {
    fetcher<{ comment: CommentType }>(`/items/${params.id}/comments`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookies.token}`,
      },
      body: JSON.stringify({
        content: comment,
      }),
    }).catch(async (err) => {
      const { message } = await err.json()
      toast.error(message)
    })
  }
  const [comments, setComments] = useState<CommentType[]>([])

  const fetchItem = () => {
    fetcher<Item>(`/items/${params.id}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        setItem(res)
      })
      .catch((err) => {
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
        setItemImage(res)
      })
      .catch((err) => {
        toast.error(err.message)
      })
  }

  const fetchComments = () => {
    fetcher<CommentType[]>(`/items/${params.id}/comments`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        setComments(res)
      })
      .catch(async (err) => {
        const { message } = await err.json()
        toast.error(message || "Comments could not be fetched")
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
        .catch(async (err) => {
          const { message } = await err.json()
          toast.error(message || "An error occurred")
        })
    } else {
      navigate("/login")
    }
  }

  const [buttonType, setButtonType] = useState<ButtonType>("purchase")

  const getButtonType = (): void => {
    if (item?.status === ItemStatus.ItemStatusSoldOut) {
      setButtonType("sold")
    } else if (item?.user_id.toString() === cookies.userID) {
      setButtonType("edit")
    } else {
      setButtonType("purchase")
    }
  }

  const onEdit = () => {
    onUpdateItem(item)
    navigate("/sell")
  }

  useEffect(() => {
    fetchItem()
    fetchComments()
  }, [])

  useEffect(() => {
    getButtonType()
  }, [item])

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
              {buttonType === "sold" && (
                <button
                  disabled={true}
                  onClick={onSubmit}
                  id="MerDisableButton"
                >
                  SoldOut
                </button>
              )}
              {buttonType === "edit" && (
                <button id="MerButton" onClick={onEdit}>
                  Edit Listing
                </button>
              )}
              {buttonType === "purchase" && (
                <button onClick={onSubmit} id="MerButton">
                  Purchase
                </button>
              )}
              <CommentBoard onComment={handleNewComment} comments={comments} />
            </div>
          </div>
        )}
      </MerComponent>
    </div>
  )
}
