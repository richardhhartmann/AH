import React, { useState } from 'react';
import axios from 'axios';
import styled, { keyframes } from 'styled-components';
import { Link } from 'react-router-dom'; // Importe o Link se estiver usando react-router
import { FiMail, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { FaSpinner } from 'react-icons/fa';
import logoImage from '../assets/images/logo.png';

// --- Styled Components ---

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #FAFAFA;
  padding: 20px;
`;

const ContentCard = styled.div`
  background-color: #FFFFFF;
  border: 1px solid #DBDBDB;
  border-radius: 8px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const LogoPlaceholder = styled.div`
  img {
    height: 70px;
    vertical-align: middle;
    margin-bottom: 35px;
  }
`;

const Header = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #262626;
  margin-bottom: 10px;
`;

const Instructions = styled.p`
  color: #8E8E8E;
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 25px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const InputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const InputIcon = styled(FiMail)`
  position: absolute;
  top: 50%;
  left: 15px;
  transform: translateY(-50%);
  color: #8E8E8E;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 12px 12px 40px; /* Espaço para o ícone */
  border: 1px solid #DBDBDB;
  border-radius: 6px;
  background-color: #FAFAFA;
  font-size: 0.9rem;

  &:focus {
    outline: none;
    border-color: #A8A8A8;
  }
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Button = styled.button`
  background-color: #fe790d; /* Laranja da sua marca */
  color: white;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;

  &:hover:not(:disabled) {
    background-color: #e06800;
  }

  &:disabled {
    background-color: #fcae74;
    cursor: not-allowed;
  }
`;

const Spinner = styled(FaSpinner)`
  animation: ${spin} 1s linear infinite;
`;

// Mensagens de feedback
const Message = styled.p`
  font-size: 0.9rem;
  margin-top: 20px;
  padding: 12px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;

  &.success {
    color: #237B4B;
    background-color: #EAF9F1;
  }

  &.error {
    color: #C13515;
    background-color: #FDEEEE;
  }
`;

const BackToLoginLink = styled(Link)`
  margin-top: 30px;
  color: #00376B;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }
`;

const ENDPOINT = process.env.REACT_APP_API_URL || 'http://localhost:5000'; // Fallback para dev

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [sentEmail, setSentEmail] = useState(''); // Armazena o e-mail enviado
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            await axios.post(`${ENDPOINT}/api/auth/forgot-password`, { email });
            setSuccess(true);
            setSentEmail(email); // Armazena o e-mail para exibir na mensagem
        } catch (err) {
            setError('Não foi possível processar a solicitação. Verifique o e-mail e tente novamente.');
            console.error("Erro ao solicitar redefinição de senha:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageContainer>
            <ContentCard>
                <LogoPlaceholder>
                    <img src={logoImage} alt="Aesthete Logo" />
                </LogoPlaceholder>
                
                {success ? (
                    <>
                        <Header>Verifique seu E-mail</Header>
                        <Message className="success">
                            <FiCheckCircle size={20} />
                            <span>
                                Um link para redefinir sua senha foi enviado para <strong>{sentEmail}</strong>.
                            </span>
                        </Message>
                        <Instructions style={{ marginTop: '20px' }}>
                            Caso não encontre o e-mail, verifique sua caixa de spam.
                        </Instructions>
                    </>
                ) : (
                    <>
                        <Header>Esqueceu sua senha?</Header>
                        <Instructions>
                            Não se preocupe! Insira seu e-mail de cadastro abaixo e enviaremos um link para você criar uma nova senha.
                        </Instructions>
                        <Form onSubmit={handleSubmit}>
                            <InputWrapper>
                                <InputIcon />
                                <Input
                                    type="email"
                                    placeholder="Seu e-mail"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </InputWrapper>
                            <Button type="submit" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Spinner />
                                        <span>Enviando...</span>
                                    </>
                                ) : (
                                    'Enviar Link de Redefinição'
                                )}
                            </Button>
                        </Form>
                    </>
                )}
                
                {error && (
                    <Message className="error">
                        <FiAlertCircle size={20} />
                        <span>{error}</span>
                    </Message>
                )}
            </ContentCard>

            <ContentCard style={{ marginTop: '10px' }}>
                <BackToLoginLink to="/login">Voltar para o Login</BackToLoginLink>
            </ContentCard>
        </PageContainer>
    );
};

export default ForgotPasswordPage;