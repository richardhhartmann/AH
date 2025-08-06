import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const CreateContainer = styled.div`
    max-width: 600px;
    margin: 40px auto;
    text-align: center;
`;

const ChoiceButton = styled(Link)`
    display: block;
    width: 100%;
    padding: 20px;
    margin: 20px 0;
    font-size: 1.2rem;
    font-weight: bold;
    color: rgb(254, 121, 13);
    border: 2px solid rgb(254, 121, 13);
    border-radius: 8px;
    text-decoration: none;
    transition: all 0.2s ease-in-out;

    &:hover {
        background-color: rgb(254, 121, 13);
        color: white;
    }
`;


const CreatePage = () => {
    return (
        <CreateContainer>
            <h2>O que você gostaria de criar?</h2>
            <ChoiceButton to="/novo-post">
                Nova Publicação (Post)
            </ChoiceButton>
            <ChoiceButton to="/stories/novo">
                Novo Story
            </ChoiceButton>
        </CreateContainer>
    );
};

export default CreatePage;