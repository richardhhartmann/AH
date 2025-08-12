import styled from 'styled-components';
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useMediaQuery from '../hooks/useMediaQuery';
import { usePostActions } from '../hooks/usePostActions';
import { API_URL } from '../api/axios';
import { CommentIcon, HeartIcon, LikedIcon } from './Icons'; // Supondo um arquivo de ícones
import * as S from './Post.styles'; // Importa todos os styled-components com um alias

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

// Função auxiliar para construir URLs de imagem de forma segura
const getImageUrl = (url) => {
    if (!url) return ''; // Retorna string vazia se a URL for nula/indefinida
    return url.startsWith('http') ? url : `${API_URL}${url}`;
};

const Post = React.memo(React.forwardRef(({ post: initialPost, onOpenMobileComments }, ref) => {
    const { 
        post, 
        handleLike, 
        handleDelete, 
        isMyPost, 
        isLikedByMe 
    } = usePostActions(initialPost);
    
    const navigate = useNavigate();
    const isMobile = useMediaQuery('(max-width: 768px)');

    const handleCommentAction = () => {
        if (isMobile && onOpenMobileComments) {
            onOpenMobileComments(post._id);
        } else {
            navigate(`/post/${post._id}`);
        }
    };

    if (!post || !post.user) return null; // Verificação de segurança

    return (
        <S.PostContainer ref={ref}>
            <S.PostHeader>
                <Link to={`/perfil/${post.user.username}`}>
                    <img src={getImageUrl(post.user.avatar)} alt={`${post.user.username}'s avatar`} />
                </Link>
                <Link to={`/perfil/${post.user.username}`}>
                    <strong>{post.user.username}</strong>
                </Link>
                {isMyPost && <S.DeleteButton onClick={handleDelete}>Deletar</S.DeleteButton>}
            </S.PostHeader>

            <S.PostImage
                src={getImageUrl(post.mediaUrl)}
                alt={post.caption}
                onDoubleClick={handleLike}
            />
            
            <S.PostActions>
                <button onClick={handleLike} aria-label={isLikedByMe ? "Descurtir" : "Curtir"}>
                    {isLikedByMe ? <LikedIcon /> : <HeartIcon />}
                </button>
                <button onClick={handleCommentAction} aria-label="Comentar">
                    <CommentIcon />
                </button>
            </S.PostActions>

            <S.PostFooter>
                <p><strong>{post.likes.length} curtidas</strong></p>
                <p>
                    <Link to={`/perfil/${post.user.username}`}>
                        <strong>{post.user.username}</strong>
                    </Link>
                    {' '}{post.caption}
                </p>
                {post.comments?.length > 0 && (
                    <span onClick={handleCommentAction}>
                        Ver todos os {post.comments.length} comentários
                    </span>
                )}
            </S.PostFooter>
        </S.PostContainer>
    );
}));

export default Post;