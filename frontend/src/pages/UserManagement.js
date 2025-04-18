import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Spinner, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const UserManagement = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('/api/users');
        setUsers(res.data.data);
      } catch (err) {
        setError('Erro ao carregar usuários');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Tem certeza que deseja excluir este usuário?')) {
      return;
    }

    try {
      await axios.delete(`/api/users/${userId}`);
      setUsers(users.filter(user => user._id !== userId));
      setDeleteSuccess('Usuário excluído com sucesso');
      setDeleteError('');
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => {
        setDeleteSuccess('');
      }, 3000);
    } catch (err) {
      setDeleteError(err.response?.data?.error || 'Erro ao excluir usuário');
      setDeleteSuccess('');
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
      <h1 className="my-4">Gerenciamento de Usuários</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {deleteError && <Alert variant="danger">{deleteError}</Alert>}
      {deleteSuccess && <Alert variant="success">{deleteSuccess}</Alert>}
      
      <Row className="mb-4">
        <Col>
          <Link to="/users/create" className="btn btn-primary">
            Criar Novo Usuário
          </Link>
        </Col>
      </Row>
      
      <Card className="shadow-sm">
        <Card.Body>
          {users.length === 0 ? (
            <Alert variant="info">Nenhum usuário cadastrado</Alert>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Função</th>
                  <th>Data de Cadastro</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.role === 'admin' ? 'Administrador' : 'Usuário'}</td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      {u._id !== user._id ? (
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => handleDeleteUser(u._id)}
                        >
                          Excluir
                        </Button>
                      ) : (
                        <span className="text-muted">Usuário atual</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default UserManagement;
