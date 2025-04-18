import React from 'react';
import { Container } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="bg-light py-3 mt-5">
      <Container className="text-center">
        <p className="text-muted mb-0">
          &copy; {new Date().getFullYear()} Todo App - Todos os direitos reservados
        </p>
      </Container>
    </footer>
  );
};

export default Footer;
