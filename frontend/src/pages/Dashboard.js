import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await api.get('/tasks');
        // Filtrar tarefas que não estão concluídas
        const pendingTasks = res.data.data.filter(task => task.status !== 'concluida');
        setTasks(pendingTasks);
      } catch (err) {
        setError('Erro ao carregar tarefas');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const handleStartTask = async (taskId) => {
    try {
      const res = await api.put(`/tasks/${taskId}/start`);
      // Atualizar a lista de tarefas
      setTasks(tasks.map(task => 
        task._id === taskId ? { ...task, status: 'em_andamento' } : task
      ));
    } catch (err) {
      setError('Erro ao iniciar tarefa');
      console.error(err);
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await api.put(`/tasks/${taskId}/complete`);
      // Remover a tarefa da lista
      setTasks(tasks.filter(task => task._id !== taskId));
    } catch (err) {
      setError('Erro ao concluir tarefa');
      console.error(err);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pendente':
        return <Badge bg="secondary">Pendente</Badge>;
      case 'em_andamento':
        return <Badge bg="primary">Em Andamento</Badge>;
      case 'atrasada':
        return <Badge bg="danger">Atrasada</Badge>;
      default:
        return <Badge bg="secondary">Pendente</Badge>;
    }
  };

  if (loading) {
    return (
      <Container>
        <h1 className="my-4">Carregando tarefas...</h1>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Carregando...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container>
      <h1 className="my-4">Minhas Tarefas</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {tasks.length === 0 ? (
        <div className="alert alert-info">
          Você não tem tarefas pendentes.
          <Link to="/tasks/create" className="btn btn-primary ms-3">
            Criar Nova Tarefa
          </Link>
        </div>
      ) : (
        <>
          <Row className="mb-4">
            <Col>
              <Link to="/tasks/create" className="btn btn-primary">
                Criar Nova Tarefa
              </Link>
            </Col>
          </Row>
          
          <Row>
            {tasks.map(task => (
              <Col md={6} lg={4} key={task._id} className="mb-4">
                <Card className="h-100 shadow-sm">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <Card.Title>{task.title}</Card.Title>
                      {getStatusBadge(task.status)}
                    </div>
                    
                    <Card.Text>
                      {task.description.length > 100
                        ? `${task.description.substring(0, 100)}...`
                        : task.description}
                    </Card.Text>
                    
                    <div className="mb-3">
                      <small className="text-muted">
                        Prazo: {new Date(task.dueDate).toLocaleDateString()}
                      </small>
                    </div>
                    
                    <div className="d-flex justify-content-between">
                      <Link to={`/tasks/${task._id}`} className="btn btn-outline-primary">
                        Ver Detalhes
                      </Link>
                      
                      {task.status === 'pendente' && task.assignedTo.some(u => u._id === user._id) && (
                        <Button 
                          variant="success" 
                          onClick={() => handleStartTask(task._id)}
                        >
                          Iniciar Tarefa
                        </Button>
                      )}
                      
                      {task.status === 'em_andamento' && task.assignedTo.some(u => u._id === user._id) && (
                        <Button 
                          variant="success" 
                          onClick={() => handleCompleteTask(task._id)}
                        >
                          Concluir Tarefa
                        </Button>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </>
      )}
    </Container>
  );
};

export default Dashboard;
