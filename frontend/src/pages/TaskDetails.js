import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Form, Alert, Spinner, ListGroup, Tab, Nav } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';

const TaskDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [task, setTask] = useState(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fileUploadError, setFileUploadError] = useState('');
  const [commentError, setCommentError] = useState('');
  
  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await api.get(`/tasks/${id}`);
        setTask(res.data.data);
      } catch (err) {
        setError('Erro ao carregar detalhes da tarefa');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [id]);

  const handleStartTask = async () => {
    try {
      const res = await api.put(`/tasks/${id}/start`);
      setTask(res.data.data);
    } catch (err) {
      setError('Erro ao iniciar tarefa');
      console.error(err);
    }
  };

  const handleCompleteTask = async () => {
    try {
      const res = await api.put(`/tasks/${id}/complete`);
      setTask(res.data.data);
    } catch (err) {
      setError('Erro ao concluir tarefa');
      console.error(err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    
    if (!comment.trim()) {
      setCommentError('O comentário não pode estar vazio');
      return;
    }
    
    try {
      const res = await api.post(`/tasks/${id}/comments`, { text: comment });
      setTask(res.data.data);
      setComment('');
      setCommentError('');
    } catch (err) {
      setCommentError('Erro ao adicionar comentário');
      console.error(err);
    }
  };

  const handleTaskFileUpload = async (e) => {
    const files = e.target.files;
    
    if (!files || files.length === 0) return;
    
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }
    
    try {
      setFileUploadError('');
      const res = await api.post(`/tasks/${id}/upload-task-files`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setTask(res.data.data);
      e.target.value = null; // Limpar input de arquivo
    } catch (err) {
      setFileUploadError(err.response?.data?.error || 'Erro ao fazer upload de arquivos');
      console.error(err);
    }
  };

  const handleCompletionFileUpload = async (e) => {
    const files = e.target.files;
    
    if (!files || files.length === 0) return;
    
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }
    
    try {
      setFileUploadError('');
      const res = await api.post(`/tasks/${id}/upload-completion-files`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setTask(res.data.data);
      e.target.value = null; // Limpar input de arquivo
    } catch (err) {
      setFileUploadError(err.response?.data?.error || 'Erro ao fazer upload de arquivos');
      console.error(err);
    }
  };

  const handleRemoveTaskFile = async (fileId) => {
    try {
      const res = await api.delete(`/tasks/${id}/task-files/${fileId}`);
      setTask(res.data.data);
    } catch (err) {
      setFileUploadError('Erro ao remover arquivo');
      console.error(err);
    }
  };

  const handleRemoveCompletionFile = async (fileId) => {
    try {
      const res = await api.delete(`/tasks/${id}/completion-files/${fileId}`);
      setTask(res.data.data);
    } catch (err) {
      setFileUploadError('Erro ao remover arquivo');
      console.error(err);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pendente':
        return <Badge bg="secondary">Pendente</Badge>;
      case 'em_andamento':
        return <Badge bg="primary">Em Andamento</Badge>;
      case 'concluida':
        return <Badge bg="success">Concluída</Badge>;
      case 'atrasada':
        return <Badge bg="danger">Atrasada</Badge>;
      default:
        return <Badge bg="secondary">Pendente</Badge>;
    }
  };

  const isAssignedToTask = () => {
    if (!task || !user) return false;
    return task.assignedTo.some(u => u._id === user._id);
  };

  const isCreatorOfTask = () => {
    if (!task || !user) return false;
    return task.createdBy._id === user._id;
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

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
        <Button variant="primary" onClick={() => navigate('/dashboard')}>
          Voltar para o Dashboard
        </Button>
      </Container>
    );
  }

  if (!task) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">Tarefa não encontrada</Alert>
        <Button variant="primary" onClick={() => navigate('/dashboard')}>
          Voltar para o Dashboard
        </Button>
      </Container>
    );
  }

  return (
    <Container className="my-4">
      <Row className="mb-4">
        <Col>
          <Button variant="outline-primary" onClick={() => navigate('/dashboard')}>
            &larr; Voltar para o Dashboard
          </Button>
        </Col>
      </Row>
      
      <Card className="shadow-sm mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h2 className="mb-0">{task.title}</h2>
          {getStatusBadge(task.status)}
        </Card.Header>
        
        <Card.Body>
          <Row className="mb-4">
            <Col md={6}>
              <p className="mb-1"><strong>Data de Início:</strong> {new Date(task.startDate).toLocaleDateString()}</p>
              <p className="mb-1"><strong>Prazo:</strong> {new Date(task.dueDate).toLocaleDateString()}</p>
              {task.completedDate && (
                <p className="mb-1"><strong>Concluída em:</strong> {new Date(task.completedDate).toLocaleDateString()}</p>
              )}
            </Col>
            
            <Col md={6}>
              <p className="mb-1"><strong>Criada por:</strong> {task.createdBy.name}</p>
              <p className="mb-1"><strong>Atribuída a:</strong></p>
              <ul className="ps-3">
                {task.assignedTo.map(user => (
                  <li key={user._id}>{user.name}</li>
                ))}
              </ul>
            </Col>
          </Row>
          
          <h5>Descrição</h5>
          <p className="mb-4">{task.description}</p>
          
          <div className="d-flex justify-content-end">
            {task.status === 'pendente' && isAssignedToTask() && (
              <Button 
                variant="success" 
                onClick={handleStartTask}
                className="ms-2"
              >
                Iniciar Tarefa
              </Button>
            )}
            
            {task.status === 'em_andamento' && isAssignedToTask() && (
              <Button 
                variant="success" 
                onClick={handleCompleteTask}
                className="ms-2"
              >
                Concluir Tarefa
              </Button>
            )}
          </div>
        </Card.Body>
      </Card>
      
      <Tab.Container id="task-tabs" defaultActiveKey="files">
        <Nav variant="tabs" className="mb-3">
          <Nav.Item>
            <Nav.Link eventKey="files">Arquivos</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="comments">Comentários</Nav.Link>
          </Nav.Item>
        </Nav>
        
        <Tab.Content>
          <Tab.Pane eventKey="files">
            {fileUploadError && <Alert variant="danger">{fileUploadError}</Alert>}
            
            <Row>
              <Col md={6}>
                <Card className="mb-4">
                  <Card.Header>
                    <h5 className="mb-0">Arquivos Necessários para a Tarefa</h5>
                  </Card.Header>
                  <Card.Body>
                    {task.taskFiles && task.taskFiles.length > 0 ? (
                      <ListGroup variant="flush">
                        {task.taskFiles.map(file => (
                          <ListGroup.Item key={file._id} className="d-flex justify-content-between align-items-center">
                            <a href={file.path} target="_blank" rel="noopener noreferrer">
                              {file.originalName}
                            </a>
                            {isCreatorOfTask() && (
                              <Button 
                                variant="outline-danger" 
                                size="sm"
                                onClick={() => handleRemoveTaskFile(file._id)}
                              >
                                Remover
                              </Button>
                            )}
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    ) : (
                      <p className="text-muted">Nenhum arquivo necessário adicionado</p>
                    )}
                    
                    {isCreatorOfTask() && (
                      <Form.Group className="mt-3">
                        <Form.Label>Adicionar Arquivos Necessários</Form.Label>
                        <Form.Text className="text-muted d-block mb-2">
                          Formatos permitidos: imagens, PDF, documentos Word e planilhas Excel
                        </Form.Text>
                        <Form.Control 
                          type="file" 
                          multiple 
                          onChange={handleTaskFileUpload}
                          accept=".jpg,.jpeg,.png,.gif,.bmp,.svg,.webp,.pdf,.doc,.docx,.xls,.xlsx,.csv"
                        />
                      </Form.Group>
                    )}
                  </Card.Body>
                </Card>
              </Col>
              
              <Col md={6}>
                <Card className="mb-4">
                  <Card.Header>
                    <h5 className="mb-0">Arquivos de Conclusão</h5>
                  </Card.Header>
                  <Card.Body>
                    {task.completionFiles && task.completionFiles.length > 0 ? (
                      <ListGroup variant="flush">
                        {task.completionFiles.map(file => (
                          <ListGroup.Item key={file._id} className="d-flex justify-content-between align-items-center">
                            <div>
                              <a href={file.path} target="_blank" rel="noopener noreferrer">
                                {file.originalName}
                              </a>
                              <small className="text-muted d-block">
                                Enviado por: {file.uploadedBy.name}
                              </small>
                            </div>
                            {file.uploadedBy._id === user._id && (
                              <Button 
                                variant="outline-danger" 
                                size="sm"
                                onClick={() => handleRemoveCompletionFile(file._id)}
                              >
                                Remover
                              </Button>
                            )}
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    ) : (
                      <p className="text-muted">Nenhum arquivo de conclusão adicionado</p>
                    )}
                    
                    {isAssignedToTask() && (
                      <Form.Group className="mt-3">
                        <Form.Label>Adicionar Arquivos de Conclusão</Form.Label>
                        <Form.Text className="text-muted d-block mb-2">
                          Formatos permitidos: imagens, PDF, documentos Word e planilhas Excel
                        </Form.Text>
                        <Form.Control 
                          type="file" 
                          multiple 
                          onChange={handleCompletionFileUpload}
                          accept=".jpg,.jpeg,.png,.gif,.bmp,.svg,.webp,.pdf,.doc,.docx,.xls,.xlsx,.csv"
                        />
                      </Form.Group>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab.Pane>
          
          <Tab.Pane eventKey="comments">
            <Card>
              <Card.Header>
                <h5 className="mb-0">Comentários</h5>
              </Card.Header>
              <Card.Body>
                {task.comments && task.comments.length > 0 ? (
                  <ListGroup variant="flush">
                    {task.comments.map(comment => (
                      <ListGroup.Item key={comment._id}>
                        <div className="d-flex justify-content-between">
                          <strong>{comment.user.name}</strong>
                          <small className="text-muted">
                            {new Date(comment.createdAt).toLocaleString()}
                          </small>
                        </div>
                        <p className="mb-0 mt-1">{comment.text}</p>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                ) : (
                  <p className="text-muted">Nenhum comentário ainda</p>
                )}
                
                <Form onSubmit={handleAddComment} className="mt-4">
                  {commentError && <Alert variant="danger">{commentError}</Alert>}
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Adicionar Comentário</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Escreva seu comentário aqui..."
                    />
                  </Form.Group>
                  
                  <Button variant="primary" type="submit">
                    Enviar Comentário
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </Container>
  );
};

export default TaskDetails;
