import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert, ListGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';

const CompletedTasks = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchCompletedTasks = async () => {
      try {
        const res = await api.get(`/tasks/completed?page=${currentPage}&limit=10`);
        setTasks(res.data.data);
        
        // Calcular total de páginas
        if (res.data.pagination) {
          const total = Math.ceil(res.data.count / 10);
          setTotalPages(total > 0 ? total : 1);
        }
      } catch (err) {
        setError('Erro ao carregar tarefas concluídas');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedTasks();
  }, [currentPage]);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (loading) {
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
      <h1 className="my-4">Tarefas Concluídas</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {tasks.length === 0 ? (
        <Alert variant="info">
          Você não tem tarefas concluídas.
          <Link to="/dashboard" className="btn btn-primary ms-3">
            Ver Tarefas Pendentes
          </Link>
        </Alert>
      ) : (
        <>
          <Row className="mb-4">
            <Col>
              <Link to="/dashboard" className="btn btn-primary">
                Ver Tarefas Pendentes
              </Link>
            </Col>
          </Row>
          
          <ListGroup className="mb-4">
            {tasks.map(task => (
              <ListGroup.Item key={task._id} className="mb-3 shadow-sm">
                <Row>
                  <Col md={8}>
                    <h4>{task.title}</h4>
                    <p className="text-muted mb-2">
                      Concluída em: {new Date(task.completedDate).toLocaleDateString()}
                    </p>
                    <p className="mb-2">
                      {task.description.length > 150
                        ? `${task.description.substring(0, 150)}...`
                        : task.description}
                    </p>
                    <div>
                      <small className="text-muted">
                        Criada por: {task.createdBy.name} | 
                        Atribuída a: {task.assignedTo.map(u => u.name).join(', ')}
                      </small>
                    </div>
                  </Col>
                  <Col md={4} className="d-flex align-items-center justify-content-end">
                    <Link to={`/tasks/${task._id}`} className="btn btn-outline-primary">
                      Ver Detalhes
                    </Link>
                  </Col>
                </Row>
              </ListGroup.Item>
            ))}
          </ListGroup>
          
          {/* Paginação */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mb-4">
              <Button 
                variant="outline-primary" 
                onClick={handlePreviousPage} 
                disabled={currentPage === 1}
                className="me-2"
              >
                &laquo; Anterior
              </Button>
              <span className="align-self-center mx-3">
                Página {currentPage} de {totalPages}
              </span>
              <Button 
                variant="outline-primary" 
                onClick={handleNextPage} 
                disabled={currentPage === totalPages}
                className="ms-2"
              >
                Próxima &raquo;
              </Button>
            </div>
          )}
        </>
      )}
    </Container>
  );
};

export default CompletedTasks;
