import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import useMediaQuery from '../hooks/useMediaQuery';
import { usePostActions } from '../hooks/usePostActions';
import { API_URL } from '../api/axios';
import { CommentIcon, HeartIcon, LikedIcon } from './Icons'; // Verifique se o caminho dos ícones está correto
import { PiChats } from "react-icons/pi";
import * as S from './Post.styles';

// Função auxiliar para construir URLs de imagem de forma segura
const getImageUrl = (url) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `${API_URL}${url}`;
};

// Função para formatar o tempo relativo
const formatTimestamp = (date) => {
    try {
        return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ptBR });
    } catch (error) {
        console.error("Data inválida para formatação:", date);
        return null;
    }
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

    if (!post || !post.user) return null;

    const formattedTimestamp = formatTimestamp(post.createdAt)?.replace('cerca de ', '');

    return (
        <S.PostContainer ref={ref}>
            <S.PostHeader>
                <Link to={`/perfil/${post.user.username}`}>
                    <img src={getImageUrl(post.user.avatar)} alt={`${post.user.username}'s avatar`} />
                </Link>
                <S.UserInfoContainer>
                    <Link to={`/perfil/${post.user.username}`}>
                        <strong>{post.user.username}</strong>
                    </Link>
                    {/* Exibe o cargo do usuário se existir */}
                    {post.user.profession && <S.UserRole>{post.user.profession}</S.UserRole>}
                    {/* Exibe o timestamp se a data for válida */}
                    {formattedTimestamp && <S.Timestamp>{formattedTimestamp}</S.Timestamp>}
                </S.UserInfoContainer>
                
                {/* 2. Adicione o container com a lógica para os botões */}
                <S.HeaderActionsContainer>
                    {/* O botão de chat só aparece se o post NÃO for seu */}
                    {!isMyPost && (
                        <S.ChatButton to={`/chat/${post.user._id}`} title={`Conversar com ${post.user.username}`}>
                            <PiChats />
                        </S.ChatButton>
                    )}

                    {/* O botão de deletar só aparece se o post FOR seu */}
                    {isMyPost && <S.DeleteButton onClick={handleDelete}>Deletar</S.DeleteButton>}
                </S.HeaderActionsContainer>
            </S.PostHeader>

            <S.PostImage
                src={getImageUrl(post.mediaUrl)}
                alt={post.caption}
                onDoubleClick={handleLike}
            />
            
            <S.PostActions>
                {/* Container para o botão de like e seu contador */}
                <S.ActionButtonContainer>
                    <button onClick={handleLike} aria-label={isLikedByMe ? "Descurtir" : "Curtir"}>
                        {isLikedByMe ? <LikedIcon /> : <HeartIcon />}
                    </button>
                    {post.likes.length > 0 && (
                        <S.CounterBadge>{post.likes.length}</S.CounterBadge>
                    )}
                </S.ActionButtonContainer>
                
                {/* Container para o botão de comentário e seu contador */}
                <S.ActionButtonContainer>
                    <button onClick={handleCommentAction} aria-label="Comentar">
                        <CommentIcon />
                    </button>
                    {post.comments?.length > 0 && (
                         <S.CounterBadge>{post.comments.length}</S.CounterBadge>
                    )}
                </S.ActionButtonContainer>
            </S.PostActions>

            <S.PostFooter>
                <p>
                    <Link to={`/perfil/${post.user.username}`}>
                        <strong>{post.user.username}</strong>
                    </Link>
                    {' '}{post.caption}
                </p>
            </S.PostFooter>
        </S.PostContainer>
    );
}));

export default Post;