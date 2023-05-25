import { ChangeEvent, useState } from "react"
import { Button } from "react-bootstrap"
import { FaSearch } from "react-icons/fa"

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
    <div className="d-flex" id="search-group">
      <input
        onKeyDown={onKeydown}
        onChange={onChange}
        type="text"
        placeholder="Search"
        id="search-input"
      />
      <Button id="search-button" onClick={onSubmitKeyword}>
        <FaSearch />
      </Button>
    </div>
  )
}
