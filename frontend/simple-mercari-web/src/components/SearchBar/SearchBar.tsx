import { ChangeEvent, useState } from "react"
import { Navbar, Container, Nav, Form, FormControl, Button } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import { Search } from "react-router";
import { useSearchBar } from "../../common/provider"

interface SearchBarProps {
  searchValue: string
  onSearch: (keyword: string) => void
}


export const SearchBar = () => {
  const [keyword, setKeyword] = useState<string>("")
  const onSearch = useSearchBar(state => state.onSearch)

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
    <Form className="d-flex" id="search-group">
      <FormControl onKeyDown={onKeydown} onChange={onChange} type="text" placeholder="Search" id="search-input" />
      <Button id="search-button" onClick={onSubmitKeyword}>
        <FaSearch />
      </Button>
    </Form>
  )
}
