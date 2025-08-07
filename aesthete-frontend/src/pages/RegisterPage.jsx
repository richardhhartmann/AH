import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, reset } from '../features/auth/authSlice';
import styled from 'styled-components';

// --- Estilos (Reaproveitados e adaptados da LoginPage) ---

const RegisterContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 0;
  background-color: #fafafa; // Fundo para a página inteira
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px; // Espaço entre a caixa de formulário e a caixa de link
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

const Logo = styled.h1`
  font-family: 'Grand Hotel', cursive; // Certifique-se de importar esta fonte no seu index.html ou App.css
  font-size: 3.5rem;
  margin-bottom: 10px;
`;

const Subheading = styled.p`
    color: #8e8e8e;
    font-size: 1.05rem;
    font-weight: 600;
    line-height: 20px;
    margin: 0 0 20px 0;
    text-align: center;
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
  font-size: 0.8rem;
`;

// Novo componente para o <select>
const StyledSelect = styled.select`
  padding: 10px;
  margin-bottom: 10px;
  background-color: #fafafa;
  border: 1px solid #dbdbdb;
  border-radius: 3px;
  font-size: 0.8rem;
  color: #8e8e8e; // Cor inicial para o placeholder

  // Remove a cor cinza quando uma opção é selecionada
  &:valid {
    color: #262626;
  }
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

const LoginLinkWrapper = styled(FormWrapper)`
    padding: 25px; // Padding menor para a caixa de link
`;

const LoginLink = styled.div`
  font-size: 0.9rem;
  a {
    color: #0095f6;
    font-weight: bold;
    text-decoration: none;
  }
`;

// --- Componente ---
const RegisterPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        profession: '',
    });

    const { username, email, password, profession } = formData;

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { user, isLoading, isError, isSuccess, message } = useSelector(
        (state) => state.auth
    );

    useEffect(() => {
        if (isError) {
            alert(message); // Idealmente, substitua por um Toast/Snackbar
        }
        if (isSuccess || user) {
            navigate('/');
        }
        dispatch(reset());
    }, [user, isError, isSuccess, message, navigate, dispatch]);

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = (e) => {
        e.preventDefault();
        // Adicionar validação de senha se necessário
        const userData = { username, email, password, profession };
        dispatch(register(userData));
    };

    return (
        <RegisterContainer>
            <Wrapper>
                <FormWrapper>
                    <Logo>Ah</Logo>
                    <Subheading>
                        Cadastre-se para acelerar sua carreira na HOF.
                    </Subheading>
                    <StyledForm onSubmit={onSubmit}>
                        <StyledInput
                            type="email"
                            name="email"
                            value={email}
                            placeholder="E-mail"
                            onChange={onChange}
                            required
                        />
                        <StyledInput
                            type="text"
                            name="username"
                            value={username}
                            placeholder="Nome de usuário"
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
                        <StyledSelect name="profession" value={profession} onChange={onChange} required>
                            <option value="" disabled>Selecione sua profissão</option>
                            <option value="Especialista em Posicionamento">Especialista em Posicionamento</option>
                            <option value="Biomédico">Biomédico</option>
                            <option value="Programador">Programador</option>
                            <option value="Esteticista">Esteticista</option>
                            <option value="Dermatologista">Dermatologista</option>
                            {/* Adicione outras opções aqui */}
                        </StyledSelect>
                        <StyledButton type="submit" disabled={isLoading}>
                            {isLoading ? 'Cadastrando...' : 'Cadastre-se'}
                        </StyledButton>
                    </StyledForm>
                </FormWrapper>
                <LoginLinkWrapper>
                     <LoginLink>
                        Tem uma conta? <Link to="/login">Conecte-se</Link>
                    </LoginLink>
                </LoginLinkWrapper>
            </Wrapper>
        </RegisterContainer>
    );
};

export default RegisterPage;