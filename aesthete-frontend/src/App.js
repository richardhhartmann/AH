import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Componentes e Páginas
import Navbar from './components/Navbar';
import MobileFooter from './components/MobileFooter';
import SearchPage from './pages/SearchPage'; // Importe a nova página de busca
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CreatePage from './pages/CreatePage';
import NewPostPage from './pages/NewPostPage';
import NewStoryPage from './pages/NewStoryPage';
import ProfilePage from './pages/ProfilePage';
import SinglePostPage from './pages/SinglePostPage';
import EditProfilePage from './pages/EditProfilePage';
import ChatPage from './pages/ChatPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import NotificationPage from './pages/NotificationPage';

function App() {
  const { user: loggedInUser } = useSelector((state) => state.auth);

  return (
    <Router>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/pesquisar" element={<SearchPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registrar" element={<RegisterPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/chat/:chatId" element={<ChatPage />} />
          <Route path="/notificacoes" element={<NotificationPage />} />
          
          <Route path="/criar" element={<CreatePage />} />
          <Route path="/novo-post" element={<NewPostPage />} />
          <Route path="/stories/novo" element={<NewStoryPage />} />

          <Route path="/post/:postId" element={<SinglePostPage />} />
          <Route path="/perfil/:username" element={<ProfilePage />} />
          <Route path="/conta/editar" element={<EditProfilePage />} />

          <Route path="/esqueci-senha" element={<ForgotPasswordPage />} />
          <Route path="/redefinir-senha/:resettoken" element={<ResetPasswordPage />} />
        </Routes>
      </main>
      {loggedInUser && <MobileFooter />}
    </Router>
  );
}

export default App;