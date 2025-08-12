import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, reset } from '../features/auth/authSlice';
import styled from 'styled-components';
import logoImage from '../assets/images/logo.png';

// --- Estilos ---
const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 0;
`;

const FormWrapper = styled.div`
  max-width: 350px;
  width: 100%;
  background-color: #fff;
  border: 1px solid #dbdbdb;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
`;

const Logo = styled(Link)`
  img {
    height: 70px;
    vertical-align: middle;
    margin-bottom: 35px;
  }
`;

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
`;

const StyledInput = styled.input`
  padding: 10px;
  margin-bottom: 10px;
  background-color: #fafafa;
  border: 1px solid #dbdbdb;
  border-radius: 3px;
`;

const StyledButton = styled.button`
  padding: 10px;
  background-color: #0095f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 10px;

  &:disabled {
    background-color: #b2dffc;
    cursor: not-allowed;
  }
`;

const Separator = styled.div`
    display: flex;
    align-items: center;
    text-align: center;
    color: #8e8e8e;
    margin: 20px 0;
    font-size: 0.8rem;
    font-weight: bold;

    &::before, &::after {
        content: '';
        flex: 1;
        border-bottom: 1px solid #dbdbdb;
    }
    &:not(:empty)::before {
        margin-right: .25em;
    }
    &:not(:empty)::after {
        margin-left: .25em;
    }
`;

const SignupLink = styled.div`
    margin-top: 20px;
    font-size: 0.9rem;
    a {
      color: #0095f6;
      font-weight: bold;
    }
`;

// --- Componente ---
const LoginPage = () => {
    const [formData, setFormData] = useState({
        identifier: '', // ANTES: email: ''
        password: '',
    });
    const { identifier, password } = formData; // ANTES: email, password

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { user, isLoading, isError, isSuccess, message } = useSelector(
        (state) => state.auth
    );

    useEffect(() => {
        if (isError) {
            alert(message); // Em uma app real, usaríamos um Toast/Snackbar
        }
        if (isSuccess || user) {
            navigate('/'); // Redireciona para o feed
        }
        dispatch(reset()); // Limpa o estado (erro/sucesso) ao entrar/sair da página
    }, [user, isError, isSuccess, message, navigate, dispatch]);

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = (e) => {
        e.preventDefault();
        const userData = { identifier, password }; // ANTES: { email, password }
        dispatch(login(userData));
    };

    return (
        <LoginContainer>
            <FormWrapper>
                <Logo>
                    <img src={logoImage} alt="Aesthete Logo" />
                </Logo>
                <StyledForm onSubmit={onSubmit}>
                    <StyledInput
                        type="text" // ANTES: type="email"
                        name="identifier" // ANTES: name="email"
                        value={identifier} // ANTES: value={email}
                        placeholder="Nome de usuário ou e-mail" // ANTES: placeholder="E-mail"
                        onChange={onChange}
                        required
                    />
                    <StyledInput
                        type="password"
                        name="password"
                        value={password}
                        placeholder="Senha"
                        onChange={onChange}
                        required
                    />
                    <StyledButton type="submit" disabled={isLoading}>
                        {isLoading ? 'Entrando...' : 'Entrar'}
                    </StyledButton>
                </StyledForm>
                <Separator>OU</Separator>
                {/* Aqui poderiam entrar botões de login com Google/Facebook */}
                <div style={{ marginTop: '10px', fontSize: '0.8rem' }}>
                    <Link to="/esqueci-senha">Esqueceu a senha?</Link>
                </div>
                <SignupLink>
                    Não tem uma conta? <Link to="/registrar">Cadastre-se</Link>
                </SignupLink>
            </FormWrapper>
        </LoginContainer>
    );
};

export default LoginPage;