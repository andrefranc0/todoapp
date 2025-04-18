import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CreateUser = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();

  const { name, email, password, role } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async e => {
    e.preventDefault();
    
    if (!name || !email || !password) {
      setError('Por favor, preencha todos os campos');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await axios.post('/api/users', formData);
      setSuccess(true);
      
      // Redirecionar para a lista de usuários após 2 segundos
      setTimeout(() => {
        navigate('/users');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao criar usuário');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <h1 className="my-4">Criar Novo Usuário</h1>
      
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="shadow-sm">
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">Usuário criado com sucesso! Redirecionando...</Alert>}
              
              <Form onSubmit={onSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Nome</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Nome completo"
                    name="name"
                    value={name}
                    onChange={onChange}
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Email"
                    name="email"
                    value={email}
                    onChange={onChange}
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Senha</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Senha"
                    name="password"
                    value={password}
                    onChange={onChange}
                    required
                    minLength="6"
                  />
                  <Form.Text className="text-muted">
                    A senha deve ter pelo menos 6 caracteres
                  </Form.Text>
                </Form.Group>
                
                <Form.Group className="mb-4">
                  <Form.Label>Função</Form.Label>
                  <Form.Select
                    name="role"
                    value={role}
                    onChange={onChange}
                  >
                    <option value="user">Usuário</option>
                    <option value="admin">Administrador</option>
                  </Form.Select>
                </Form.Group>
                
                <div className="d-flex justify-content-between">
                  <Button 
                    variant="secondary" 
                    onClick={() => navigate('/users')}
                  >
                    Cancelar
                  </Button>
                  
                  <Button 
                    variant="primary" 
                    type="submit" 
                    disabled={loading}
                  >
                    {loading ? 'Criando...' : 'Criar Usuário'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CreateUser;
