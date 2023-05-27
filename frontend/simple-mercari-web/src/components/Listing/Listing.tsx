import React, { useEffect, useState } from "react"
import { useCookies } from "react-cookie"
import { MerComponent } from "../MerComponent"
import { toast } from "react-toastify"
import { fetcher } from "../../helper"
import { useNavigate } from "react-router-dom"
import { Item } from "../ItemDetail"

interface Category {
  id: number
  name: string
}

type formDataType = {
  name: string
  category_id: number
  price: number
  description: string
  image: string | File
}

interface ListingProps {
  itemValue: Item | undefined
  onResetItemState: () => void
}

export const Listing = (props: ListingProps) => {
  const initialState = {
    name: "",
    category_id: 1,
    price: 0,
    description: "",
    image: "",
  }
  const [values, setValues] = useState<formDataType>(initialState)
  const [categories, setCategories] = useState<Category[]>([])
  const [cookies] = useCookies(["token", "userID"])

  const navigate = useNavigate()
  if (!cookies.token || !cookies.userID) {
    navigate("/login")
  }

  const onUpdateItem = () => {
    if (!!props.itemValue) {
      setValues({
        ...values,
        name: props.itemValue.name,
        category_id: props.itemValue.category_id,
        price: props.itemValue.price,
        description: props.itemValue.description,
      })
    }
  }

  const onValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues({
      ...values,
      [event.target.name]: event.target.value,
    })
  }

  const onSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setValues({
      ...values,
      [event.target.name]: event.target.value,
    })
  }

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues({
      ...values,
      [event.target.name]: event.target.files![0],
    })
  }

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData()
    data.append("name", values.name)
    data.append("category_id", values.category_id.toString())
    data.append("price", values.price.toString())
    data.append("description", values.description)
    data.append("image", values.image)



    if (!props.itemValue) {
      fetcher<{ id: number }>(`/items`, {
        method: "POST",
        body: data,
        headers: {
          Authorization: `Bearer ${cookies.token}`,
        },
      })
        .then((res) => {
          sell(parseInt(cookies.userID), res.id)
        })
        .catch((error: Error) => {
          toast.error(error.message)
          console.error("POST error:", error)
        })
    } else {
      console.log("updating item from listing")
      fetcher<{ id: number }>(`/items/${props.itemValue.id}`, {
        method: "PUT",
        body: data,
        headers: {
          Authorization: `Bearer ${cookies.token}`,
        },
      })
        .then((res) => {
          sell(parseInt(cookies.userID), res.id)
        })
        .catch((error: Error) => {
          toast.error(error.message)
          console.error("POST error:", error)
        })
    }
  }

  const sell = (userID: number, itemID: number) =>
    fetcher(`/sell`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookies.token}`,
      },

      body: JSON.stringify({
        user_id: userID,
        item_id: itemID,
      }),
    })
      .then((_) => {
        toast.success("Item added successfully!")
      })
      .catch((error: Error) => {
        toast.error(error.message)
        console.error("POST error:", error)
      })

  const fetchCategories = () => {
    fetcher<Category[]>(`/items/categories`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })
      .then((items) => setCategories(items))
      .catch((err) => {
        console.log(`GET error:`, err)
        toast.error(err.message)
      })
  }

  const onCancelEdit = () => {
    props.onResetItemState()
    navigate(`/item/${props.itemValue?.id}`)
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    onUpdateItem()
  }, [props.itemValue])

  return (
    <MerComponent>
      <div className="Listing">
        <form onSubmit={onSubmit} className="ListingForm">
          {!!props.itemValue ? <h1>Edit Listing</h1> : <h1>List New Item</h1>}
          <div>
            <div className="mb-3">
              <input
                type="text"
                name="name"
                id="MerTextInput"
                className="form-control"
                placeholder="name"
                value={values.name}
                onChange={onValueChange}
                required
              />
            </div>
            <div className="mb-3">
              <select
                name="category_id"
                id="MerTextInput"
                className="form-select"
                value={values.category_id}
                onChange={onSelectChange}
              >
                {categories &&
                  categories.map((category) => {
                    return <option value={category.id}>{category.name}</option>
                  })}
              </select>
            </div>
            <div className="mb-3">
              <input
                type="number"
                name="price"
                id="MerTextInput"
                className="form-control"
                placeholder="price"
                value={values.price}
                onChange={onValueChange}
                required
              />
            </div>
            <div className="mb-3">
              <input
                type="text"
                name="description"
                id="MerTextInput"
                className="form-control"
                placeholder="description"
                value={values.description}
                onChange={onValueChange}
                required
              />
            </div>
            <div className="mb-3">
              <input
                type="file"
                name="image"
                id="MerTextInput"
                className="form-control"
                onChange={onFileChange}
                required
              />
            </div>
            {!props.itemValue && (
              <button type="submit" id="MerButton" className="btn btn-danger">
                List this item
              </button>
            )}
            {!!props.itemValue && (
              <div>
                <button type="submit" id="MerButton" className="btn btn-danger">
                  Edit Listing
                </button>
                <button
                  type="button"
                  className="btn btn-outline-danger button"
                  onClick={onCancelEdit}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </MerComponent>
  )
}
