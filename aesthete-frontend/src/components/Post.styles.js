import styled from 'styled-components';

export const PostContainer = styled.div`
    background-color: #fff;
    border: 1px solid #dbdbdb;
    border-radius: 8px;
    margin-bottom: 24px;
    max-width: 615px;
`;

export const PostHeader = styled.div`
    display: flex;
    align-items: center;
    padding: 14px 16px;
    
    img {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        margin-right: 14px;
        object-fit: cover;
    }
    
    strong {
        font-size: 0.9rem;
    }
`;

export const DeleteButton = styled.button`
    background: none;
    border: none;
    color: #ed4956;
    font-weight: bold;
    cursor: pointer;
    margin-left: auto;
    font-size: 0.9rem;
`;

export const PostImage = styled.img`
    width: 100%;
    height: auto;
    object-fit: cover;
    border-top: 1px solid #dbdbdb;
    border-bottom: 1px solid #dbdbdb;
    cursor: pointer;
`;

export const PostActions = styled.div`
    padding: 8px 16px;
    
    button {
        background: none;
        border: none;
        cursor: pointer;
        padding: 8px;
        margin-right: 8px;
    }
    
    svg {
        width: 24px;
        height: 24px;
    }
`;

export const PostFooter = styled.div`
    padding: 0 16px 16px;
    font-size: 0.85rem;
    
    p {
        margin: 0 0 4px;
        line-height: 1.4;
    }
    
    strong {
        cursor: pointer;
    }

    span {
        color: #8e8e8e;
        font-size: 0.8rem;
        cursor: pointer;
    }
`;