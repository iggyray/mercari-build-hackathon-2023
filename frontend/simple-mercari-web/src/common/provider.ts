import create from "zustand"

interface SearchBarProps {
    searchValue: string
    onSearch: (keyword: string) => void
}

export const useSearchBar = create<SearchBarProps>((set) => ({
    searchValue: "",
    onSearch: (keyword: string) => {
        set({ searchValue: keyword })
    }
}))
