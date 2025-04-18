import React, { useState, useContext } from 'react';
import { Form, Button, Card, Alert, Container, Row, Col } from 'react-bootstrap';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const { login, isAuthenticated, error, clearError } = useContext(AuthContext);

  const { email, password } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    clearError();
    setLocalError('');
  };

  const onSubmit = async e => {
    e.preventDefault();
    
    if (!email || !password) {
      setLocalError('Por favor, preencha todos os campos');
      return;
    }
    
    setLoading(true);
    const success = await login(email, password);
    setLoading(false);
    
    if (!success) {
      setFormData({ ...formData, password: '' });
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <Container>
      <Row className="justify-content-center mt-5">
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Body>
              <h2 className="text-center mb-4">Login</h2>
              
              {(error || localError) && (
                <Alert variant="danger">
                  {error || localError}
                </Alert>
              )}
              
              <Form onSubmit={onSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Seu email"
                    name="email"
                    value={email}
                    onChange={onChange}
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-4">
                  <Form.Label>Senha</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Sua senha"
                    name="password"
                    value={password}
                    onChange={onChange}
                    required
                  />
                </Form.Group>
                
                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100" 
                  disabled={loading}
                >
                  {loading ? 'Entrando...' : 'Entrar'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
