import { useCookies } from "react-cookie";
import "./Header.css";
import { Navbar, Container, Nav, Form, FormControl, Button } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import { AiOutlineClose } from 'react-icons/ai';
import { useState } from "react";
import { SearchBar } from "../SearchBar/SearchBar";
import { useNavigate } from "react-router-dom";


interface SearchBarProps {
  onSearch: (keyword: string) => void
}

export const Header = ({ onSearch }: SearchBarProps) => {
  const [cookies, _, removeCookie] = useCookies(["userID", "userName", "token"]);
  const [showNavbar, setShowNavbar] = useState(false);
  const navigate = useNavigate();


  const onLogout = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault()
    removeCookie("userID")
    removeCookie("userName")
    removeCookie("token")
  }
  const handleNavbarToggle = () => {
    setShowNavbar(!showNavbar)
  }

  return (
    <>
      <Navbar bg="#222427" variant="dark" expand="lg">
        <Container fluid>
          <Nav>
            {showNavbar ? null : <Navbar.Brand className="hand-cursor" onClick={() => navigate("/")}>Simple Mercari</Navbar.Brand>}
            <Navbar.Toggle aria-controls="responsive-navbar-nav" onClick={handleNavbarToggle}> {showNavbar ? <AiOutlineClose /> : <FaSearch />}</Navbar.Toggle>
            <Navbar.Collapse id="responsive-navbar-nav" className={showNavbar ? 'show' : ''}>
              <Nav className="me-auto">
                <SearchBar onSearch={onSearch} />
              </Nav>
            </Navbar.Collapse>
          </Nav>
          {
            showNavbar ? null : <Nav className="md:ml-auto">

              {cookies.token &&
                cookies.userID ? <Nav> <Nav.Link onClick={() => navigate(`/user/${cookies.userID}`)}>Account</Nav.Link>
                <Nav.Link onClick={onLogout}>Logout</Nav.Link> <button id="MerButton" onClick={() => navigate("/sell")}>Sell</button> </Nav> : <Nav><Nav.Link onClick={() => navigate("/login")}>Account</Nav.Link><button id="MerButton" onClick={() => navigate("/login")}>Sell</button> </Nav>}

            </Nav>
          }
        </Container>
      </Navbar>
    </>
  )
}
