// Post.jsx

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { fetchChats } from '../features/chat/chatSlice';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import useMediaQuery from '../hooks/useMediaQuery';
import { usePostActions } from '../hooks/usePostActions';
import { API_URL } from '../api/axios';
import { CommentIcon, HeartIcon, LikedIcon, LikedIconPreview } from './Icons';
import { PiChats } from "react-icons/pi";
import * as S from './Post.styles';
import api from '../api/axios'; // <-- 1. IMPORTAR A INSTÂNCIA DO AXIOS

// ... (funções getImageUrl e formatTimestamp permanecem as mesmas)
const getImageUrl = (url) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `${API_URL}${url}`;
};

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
        handleLike: originalHandleLike,
        handleDelete, 
        isMyPost, 
        isLikedByMe 
    } = usePostActions(initialPost);
    
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const isMobile = useMediaQuery('(max-width: 768px)');
    
    const [isExpanded, setIsExpanded] = useState(false);
    const [showReadMore, setShowReadMore] = useState(false);
    const captionRef = useRef(null);

    const [showAnimation, setShowAnimation] = useState(false);
    const animationTimeoutRef = useRef(null);

    const handleLike = () => {
        if (!isLikedByMe) {
            setShowAnimation(true);
            if (animationTimeoutRef.current) {
                clearTimeout(animationTimeoutRef.current);
            }
            animationTimeoutRef.current = setTimeout(() => {
                setShowAnimation(false);
            }, 800);
        }
        originalHandleLike();
    };
    
    useEffect(() => {
        return () => {
            if (animationTimeoutRef.current) {
                clearTimeout(animationTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        const element = captionRef.current;
        if (element) {
            if (element.scrollHeight > element.clientHeight) {
                setShowReadMore(true);
            }
        }
    }, [post.caption]);

    const toggleExpanded = () => {
        setIsExpanded(prev => !prev);
    };

    const handleCommentAction = () => {
        if (isMobile && onOpenMobileComments) {
            onOpenMobileComments(post._id);
        } else {
            navigate(`/post/${post._id}`);
        }
    };

    // --- 2. NOVA FUNÇÃO PARA INICIAR O CHAT ---
    const handleStartChat = async () => {
        if (!post?.user?._id) return;
        try {
            const { data } = await api.post('/chats', { userId: post.user._id });
            dispatch(fetchChats());
            navigate(`/chat/${data._id}`);
        } catch (error) {
            console.error("Erro ao iniciar chat a partir do post", error);
        }
    };

    if (!post || !post.user) return null;

    const formattedTimestamp = formatTimestamp(post.createdAt)?.replace('cerca de ', '');
    const commentsForPreview = post.comments?.filter(comment => comment && comment.author && comment.author.username) || [];
    const totalComments = post.commentsCount ?? post.comments?.length ?? 0;

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
                    {post.user.profession && <S.UserRole>{post.user.profession}</S.UserRole>}
                    {formattedTimestamp && <S.Timestamp>{formattedTimestamp}</S.Timestamp>}
                </S.UserInfoContainer>
                
                <S.HeaderActionsContainer>
                    {!isMyPost && (
                        // --- 3. BOTÃO ATUALIZADO ---
                        <S.ChatButton onClick={handleStartChat} title={`Conversar com ${post.user.username}`}>
                            <PiChats />
                        </S.ChatButton>
                    )}
                    {isMyPost && <S.DeleteButton onClick={handleDelete}>Deletar</S.DeleteButton>}
                </S.HeaderActionsContainer>
            </S.PostHeader>

            {/* O RESTO DO SEU COMPONENTE CONTINUA IGUAL */}
            
            <S.CaptionContainer>
                <S.Legenda ref={captionRef} isExpanded={isExpanded}>
                    {post.caption}
                </S.Legenda>
                {showReadMore && (
                    <S.ReadMoreButton onClick={toggleExpanded}>
                        {isExpanded ? 'Ler menos' : 'Ler mais...'}
                    </S.ReadMoreButton>
                )}
            </S.CaptionContainer>
            
            <S.PostImageContainer onDoubleClick={handleLike}>
                 <S.PostImage
                    src={getImageUrl(post.mediaUrl)}
                    alt={post.caption}
                />
                <S.LikeAnimationIcon className={showAnimation ? 'animate' : ''}>
                    <LikedIconPreview />
                </S.LikeAnimationIcon>
            </S.PostImageContainer>

            <S.PostActions>
                <S.ActionButtonContainer>
                    <button onClick={handleLike} aria-label={isLikedByMe ? "Descurtir" : "Curtir"}>
                        {isLikedByMe ? <LikedIcon /> : <HeartIcon />}
                    </button>
                    {post.likes.length > 0 && (
                        <S.CounterBadge>{post.likes.length}</S.CounterBadge>
                    )}
                </S.ActionButtonContainer>
                
                <S.ActionButtonContainer>
                    <button onClick={handleCommentAction} aria-label="Comentar">
                        <CommentIcon />
                    </button>
                    {totalComments > 0 && (
                         <S.CounterBadge>{totalComments}</S.CounterBadge>
                    )}
                </S.ActionButtonContainer>
            </S.PostActions>
            
            {commentsForPreview.length > 0 && (
                <S.CommentsPreviewContainer>
                    {commentsForPreview.slice(0, 2).map(comment => (
                        <S.CommentPreviewItem key={comment._id}>
                            <Link to={`/perfil/${comment.author.username}`}>
                                <strong>{comment.author.username}</strong>
                            </Link>
                            {comment.text}
                        </S.CommentPreviewItem>
                    ))}
                    {totalComments > 2 && (
                        <S.ViewAllCommentsLink to={`/post/${post._id}`}>
                            Ver todos os {totalComments} comentários
                        </S.ViewAllCommentsLink>
                    )}
                </S.CommentsPreviewContainer>
            )}

        </S.PostContainer>
    );
}));

export default Post;