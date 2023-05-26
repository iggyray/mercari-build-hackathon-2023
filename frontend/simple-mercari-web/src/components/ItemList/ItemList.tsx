import React from "react"
import { Item } from "../Item"
interface ItemType {
  id: number
  name: string
  price: number
  category_name: string
  status: number
}

interface Prop {
  items: ItemType[]
}

export const ItemList: React.FC<Prop> = (props) => {
  return (
    <div className="ItemListWrapper">
      {props.items &&
        props.items.map((item) => {
          return <Item item={item} />
        })}
    </div>
  )
}
