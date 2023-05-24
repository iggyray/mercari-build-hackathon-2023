import { useCookies } from "react-cookie";
import "./Header.css";
import { Navbar, Container, Nav, Form, FormControl, Button } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import { AiOutlineClose } from 'react-icons/ai';
import { useState } from "react";
import { SearchBar } from "../SearchBar/SearchBar";

export const Header: React.FC = () => {
  const [cookies, _, removeCookie] = useCookies(["userID", "token"]);
  const [showNavbar, setShowNavbar] = useState(false);

  const onLogout = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    removeCookie("userID");
    removeCookie("token");
  };
  const handleNavbarToggle = () => {
    setShowNavbar(!showNavbar);
  };

  return (
    <>
      <Navbar bg="#222427" variant="dark" expand="lg">
        <Container fluid>
          <Nav>
            {showNavbar ? null : <Navbar.Brand>Simple Mercari</Navbar.Brand>}
            <Navbar.Toggle aria-controls="responsive-navbar-nav" onClick={handleNavbarToggle}> {showNavbar ? <AiOutlineClose /> : <FaSearch />}</Navbar.Toggle>
            <Navbar.Collapse id="responsive-navbar-nav" className={showNavbar ? 'show' : ''}>
              <Nav className="me-auto">
                <SearchBar />
              </Nav>
            </Navbar.Collapse>
          </Nav>
          {
            showNavbar ? null : <Nav className="md:ml-auto">
              <Nav.Link href="#account">Account</Nav.Link>
              <Nav.Link onClick={onLogout}>Logout</Nav.Link>
            </Nav>
          }


        </Container>
      </Navbar>
      {/* <header>
        <p>
          <b>Simple Mercari</b>
        </p>
        <div className="LogoutButtonContainer">
          <button onClick={onLogout} id="MerButton">
            Logout
          </button>
        </div>
      </header> */}
    </>
  );
}
