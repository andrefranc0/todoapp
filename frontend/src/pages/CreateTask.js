import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const CreateTask = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    dueDate: '',
    assignedTo: []
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();

  // Buscar usuários para atribuir tarefas
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/users');
        setUsers(res.data.data);
      } catch (err) {
        console.error('Erro ao carregar usuários:', err);
      } finally {
        setUsersLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const { title, description, startDate, dueDate, assignedTo } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onCheckboxChange = e => {
    const userId = e.target.value;
    if (e.target.checked) {
      setFormData({
        ...formData,
        assignedTo: [...assignedTo, userId]
      });
    } else {
      setFormData({
        ...formData,
        assignedTo: assignedTo.filter(id => id !== userId)
      });
    }
  };

  const onSubmit = async e => {
    e.preventDefault();
    
    if (!title || !description || !startDate || !dueDate || assignedTo.length === 0) {
      setError('Por favor, preencha todos os campos e selecione pelo menos um usuário');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await api.post('/tasks', formData);
      setSuccess(true);
      
      // Redirecionar para o dashboard após 2 segundos
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao criar tarefa');
    } finally {
      setLoading(false);
    }
  };

  if (usersLoading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Carregando...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container>
      <h1 className="my-4">Criar Nova Tarefa</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">Tarefa criada com sucesso! Redirecionando...</Alert>}
      
      <Card className="shadow-sm">
        <Card.Body>
          <Form onSubmit={onSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Título</Form.Label>
              <Form.Control
                type="text"
                placeholder="Título da tarefa"
                name="title"
                value={title}
                onChange={onChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Descrição</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Descrição detalhada da tarefa"
                name="description"
                value={description}
                onChange={onChange}
                required
              />
            </Form.Group>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Data de Início</Form.Label>
                  <Form.Control
                    type="date"
                    name="startDate"
                    value={startDate}
                    onChange={onChange}
                    required
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Prazo para Conclusão</Form.Label>
                  <Form.Control
                    type="date"
                    name="dueDate"
                    value={dueDate}
                    onChange={onChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-4">
              <Form.Label>Atribuir a</Form.Label>
              <div className="border rounded p-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {users.length > 0 ? (
                  users.map(user => (
                    <Form.Check
                      key={user._id}
                      type="checkbox"
                      id={`user-${user._id}`}
                      label={`${user.name} (${user.email})`}
                      value={user._id}
                      onChange={onCheckboxChange}
                      className="mb-2"
                    />
                  ))
                ) : (
                  <p className="text-muted mb-0">Nenhum usuário disponível</p>
                )}
              </div>
            </Form.Group>
            
            <div className="d-flex justify-content-between">
              <Button 
                variant="secondary" 
                onClick={() => navigate('/dashboard')}
              >
                Cancelar
              </Button>
              
              <Button 
                variant="primary" 
                type="submit" 
                disabled={loading}
              >
                {loading ? 'Criando...' : 'Criar Tarefa'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default CreateTask;
