import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/routing/PrivateRoute';
import AdminRoute from './components/routing/AdminRoute';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CompletedTasks from './pages/CompletedTasks';
import CreateTask from './pages/CreateTask';
import TaskDetails from './pages/TaskDetails';
import UserManagement from './pages/UserManagement';
import CreateUser from './pages/CreateUser';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="d-flex flex-column min-vh-100">
          <Header />
          <main className="flex-grow-1 py-3">
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/login" element={<Login />} />
              
              <Route 
                path="/dashboard" 
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                } 
              />
              
              <Route 
                path="/tasks/completed" 
                element={
                  <PrivateRoute>
                    <CompletedTasks />
                  </PrivateRoute>
                } 
              />
              
              <Route 
                path="/tasks/create" 
                element={
                  <PrivateRoute>
                    <CreateTask />
                  </PrivateRoute>
                } 
              />
              
              <Route 
                path="/tasks/:id" 
                element={
                  <PrivateRoute>
                    <TaskDetails />
                  </PrivateRoute>
                } 
              />
              
              <Route 
                path="/users" 
                element={
                  <AdminRoute>
                    <UserManagement />
                  </AdminRoute>
                } 
              />
              
              <Route 
                path="/users/create" 
                element={
                  <AdminRoute>
                    <CreateUser />
                  </AdminRoute>
                } 
              />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
