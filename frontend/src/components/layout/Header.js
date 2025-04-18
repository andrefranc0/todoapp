import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const Header = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const authLinks = (
    <>
      <Nav.Link as={Link} to="/dashboard">Tarefas Pendentes</Nav.Link>
      <Nav.Link as={Link} to="/tasks/completed">Tarefas Concluídas</Nav.Link>
      <Nav.Link as={Link} to="/tasks/create">Nova Tarefa</Nav.Link>
      {user && user.role === 'admin' && (
        <Nav.Link as={Link} to="/users">Gerenciar Usuários</Nav.Link>
      )}
      <Button 
        variant="outline-light" 
        className="ms-2" 
        onClick={handleLogout}
      >
        Sair
      </Button>
    </>
  );

  const guestLinks = (
    <Nav.Link as={Link} to="/login">Login</Nav.Link>
  );

  return (
    <Navbar bg="primary" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">Todo App</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            {isAuthenticated ? authLinks : guestLinks}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
