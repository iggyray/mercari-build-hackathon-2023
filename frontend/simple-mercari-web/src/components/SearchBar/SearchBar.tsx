import { ChangeEvent, useState } from "react"

interface SearchBarProps {
  onSearch: (keyword: string) => void
}

export const SearchBar = ({ onSearch }: SearchBarProps) => {
  const [keyword, setKeyword] = useState<string>("")

  const onKeydown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      onSearch(keyword)
    }
  }

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setKeyword(value)
  }

  const onSubmitKeyword = () => {
    onSearch(keyword)
  }
  return (
    <div className="input-group">
      <input
        onKeyDown={onKeydown}
        onChange={onChange}
        className="form-control SearchBar"
        placeholder="Search for an item"
      ></input>
      <div className="input-group-append">
        <button onClick={onSubmitKeyword} className="btn btn-outline-secondary">
          Search
        </button>
      </div>
    </div>
  )
}
