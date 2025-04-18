import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <Container className="text-center mt-5">
      <h1 className="display-4">404</h1>
      <h2 className="mb-4">Página não encontrada</h2>
      <p className="lead mb-4">
        A página que você está procurando não existe ou foi movida.
      </p>
      <Link to="/dashboard">
        <Button variant="primary">Voltar para o Dashboard</Button>
      </Link>
    </Container>
  );
};

export default NotFound;