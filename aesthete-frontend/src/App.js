import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar'; 
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NewPostPage from './pages/NewPostPage'; 
import ProfilePage from './pages/ProfilePage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import SinglePostPage from './pages/SinglePostPage';
import EditProfilePage from './pages/EditProfilePage';
import ChatPage from './pages/ChatPage';
import NewStoryPage from './pages/NewStoryPage'


function App() {
  return (
    <Router>
      <Navbar /> {/* <-- Adicione a Navbar aqui, fora do <Routes> */}
      <main> {/* Adicionamos um <main> para o conteúdo principal */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registrar" element={<RegisterPage />} />
          <Route path="/novo-post" element={<NewPostPage />} />
          <Route path="/perfil/:username" element={<ProfilePage />} />
            <Route path="/post/:postId" element={<SinglePostPage />} /> 
            <Route path="/conta/editar" element={<EditProfilePage />} />
            <Route path="/esqueci-senha" element={<ForgotPasswordPage />} />
            <Route path="/redefinir-senha/:resettoken" element={<ResetPasswordPage />} />
            <Route path="/esqueci-senha" element={<ForgotPasswordPage />} />
          <Route path="/redefinir-senha/:resettoken" element={<ResetPasswordPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/stories/novo" element={<NewStoryPage />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;