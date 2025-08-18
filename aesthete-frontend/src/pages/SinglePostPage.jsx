import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api, { API_URL } from '../api/axios';
import styled, { css, keyframes } from 'styled-components'; // Importe 'keyframes' aqui também
import { HeartIcon, LikedIcon, LikedIconPreview, CommentIcon } from '../components/Icons';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// --- NOVOS CONTAINERS PARA CONTROLE DE VISIBILIDADE ---
const likeAnimation = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.1) translateY(0);
  }
  50% {
    opacity: 1;
    transform: scale(1.2) translateY(-20px);
  }
  100% {
    opacity: 0;
    transform: scale(1) translateY(50px);
  }
`;

const LikeAnimationIcon = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  opacity: 0;
  pointer-events: none;

  svg {
    width: 100px;
    height: 100px;
    filter: drop-shadow(0 0 5px rgba(0, 0, 0, 0.5));
  }

  &.animate {
    animation: ${likeAnimation} 0.8s ease-in-out forwards;
  }
`;

const MobileViewContainer = styled.div`
  display: block; /* Visível por padrão (mobile) */
  @media (min-width: 768px) {
    display: none; /* Oculto em telas maiores (desktop) */
  }
`;

const DesktopViewContainer = styled.div`
  display: none; /* Oculto por padrão (mobile) */
  @media (min-width: 768px) {
    display: block; /* Visível em telas maiores (desktop) */
  }
`;
// --- FIM DOS NOVOS CONTAINERS ---


const CaptionContainer = styled.div`
  padding: 0 15px;
  margin-bottom: 20px;
  
  /* Estilo para a versão desktop, que agora fica dentro do DesktopViewContainer */
  @media (min-width: 768px) {
    padding: 0 16px;
    margin-top: 16px;
    margin-bottom: 0px;
  }
`;

const Legenda = styled.div`
  max-width: 500px;
  word-wrap: break-word;
  line-height: 1.4;
  font-size: 0.9rem;

  strong {
      margin-right: 4px;
  }

  a {
    text-decoration: none;
    color: #000;
  }

  ${({ isExpanded }) => !isExpanded && css`
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  `}
`;

const ReadMoreButton = styled.strong`
  display: inline-block;
  font-weight: bold;
  color: #313131ff;
  cursor: pointer;
  margin-top: 4px;
  font-size: 0.8rem;
`;

const PageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background-color: #fafafa;

  @media (max-width: 768px) {
    padding: 0;
    min-height: calc(100vh - 120px);
    align-items: flex-start;
  }
`;

const PostAndCommentsWrapper = styled.div`
  display: flex;
  background-color: #fff;
  border: 1px solid #dbdbdb;
  border-radius: 8px;
  overflow: hidden;
  max-width: 935px;
  width: 100%;
  max-height: 90vh;
  
  @media (max-width: 768px) {
    flex-direction: column;
    border: none;
    border-radius: 0;
    height: 100%;
    max-height: none;
    width: 100vw;
  }
`;

const ImageContainer = styled.div`
  flex: 1.5;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative; // Adicionado para posicionamento
  cursor: pointer; // Adicionado para indicar que é clicável

  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    min-height: 400px;
  }
`;

const DetailsContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 300px;
  overflow: hidden;

  @media (max-width: 768px) {
    flex-grow: 1; 
    min-height: 0;
  }
`;

const UserInfoContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    line-height: 1.3;
`;

const UserRole = styled.span`
    font-size: 0.75rem;
    font-weight: bold;
    color: rgb(254, 121, 13);
`;

const Timestamp = styled.span`
    font-size: 0.7rem;
    color: #313131ff;
    margin-top: 1px;
`;

const HeaderActionsContainer = styled.div`
    margin-left: auto;
    display: flex;
    align-items: center;
`;

const DeleteButton = styled.button`
    background: none;
    border: none;
    color: #ed4956;
    font-weight: bold;
    cursor: pointer;
    font-size: 0.9rem;
`;


const PostHeaderMobile = styled.div`
  display: none;
  flex-direction: row;
  align-items: center;
  padding: 10px 16px;

  img {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    margin-right: 12px;
  }

  a {
    text-decoration: none;
    color: #000;
  }
  
  strong {
      margin-right: 8px;
  }

  @media (max-width: 768px) {
    display: flex;
  }
`;

const PostHeaderTop = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
`;

const PostHeader = styled.div`
  display: flex;
  flex-direction: column; /* Alterado de 'row' para 'column' */
  align-items: flex-start;
  padding: 14px 16px;
  border-bottom: 1px solid #dbdbdb;
  flex-shrink: 0;

  img {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    margin: 0 12px 0 0;
  }

  a {
    text-decoration: none;
    color: #000;
    font-weight: bold;
  }

  @media (max-width: 767px) {
    display: none;
  }
`;

const CommentList = styled.ul`
  list-style: none;
  padding: 16px;
  flex-grow: 1;
  overflow-y: auto;
`;

const CommentItem = styled.li`
  margin-bottom: 16px;
  font-size: 0.9rem;
  display: flex;
  align-items: flex-start;
  line-height: 1.4;

  img {
    width: 32px;
    height: 32px;
    border-radius: 100%;
    margin-right: 12px;
  }

  p {
    word-break: break-word;
    flex: 1;
    min-width: 0;
  }
`;

const ActionsWrapper = styled.div`
  display: flex;
  padding: 4px 8px;
  flex-shrink: 0;
`;

const ActionButtonContainer = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const CounterBadge = styled.span`
  position: absolute;
  top: 3px;
  right: -5px;
  background-color: rgb(254, 121, 13);
  color: white;
  font-size: 0.6rem;     /* aumenta o texto */
  border-radius: 50%;    /* círculo perfeito */
  width: 18px;           /* aumenta largura */
  height: 18px;          /* aumenta altura */
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid white;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  
  svg {
    width: 24px;
    height: 24px;
  }
`;

const CommentForm = styled.form`
  display: flex;
  padding: 10px;
  border-top: 1px solid #dbdbdb;
  flex-shrink: 0;
  input {
    flex-grow: 1;
    border: none;
    padding: 8px;
    outline: none;
  }
  button {
    background: none;
    border: none;
    color: rgb(254, 121, 13);
    font-weight: bold;
    cursor: pointer;
  }
`;

const formatTimestamp = (date) => {
    try {
        return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ptBR });
    } catch (error) {
        console.error("Data inválida para formatação:", date);
        return null;
    }
};

const SinglePostPage = () => {
    const { postId } = useParams();
    const navigate = useNavigate();
    const { user: loggedInUser } = useSelector((state) => state.auth);

    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const commentInputRef = useRef(null);

    const [isExpanded, setIsExpanded] = useState(false);
    const [showReadMore, setShowReadMore] = useState(false);
    const captionRef = useRef(null);
    
    // --- NOVO ESTADO PARA ANIMAÇÃO ---
    const [showAnimation, setShowAnimation] = useState(false);
    const animationTimeoutRef = useRef(null);

    useEffect(() => {
      // Limpa o timeout quando o componente é desmontado
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
    }, [post]);

    const toggleExpanded = () => {
        setIsExpanded(prev => !prev);
    };

    useEffect(() => {
        const fetchPost = async () => {
            setLoading(true);
            try {
                const { data } = await api.get(`/posts/${postId}`);
                setPost(data);
                setComments(data.comments || []);
            } catch (error) {
                console.error("Erro ao buscar o post", error);
                navigate('/');
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [postId, navigate]);

    // --- FUNÇÃO DE LIKE ATUALIZADA ---
    const handleLike = async () => {
        if (!post || !loggedInUser) return;

        const isAlreadyLiked = post.likes.includes(loggedInUser._id);
        
        // Ativa a animação apenas se não estiver curtido
        if (!isAlreadyLiked) {
            setShowAnimation(true);
            if (animationTimeoutRef.current) {
                clearTimeout(animationTimeoutRef.current);
            }
            animationTimeoutRef.current = setTimeout(() => {
                setShowAnimation(false);
            }, 800);
        }

        const originalPost = { ...post };
        const newLikes = isAlreadyLiked
            ? post.likes.filter(id => id !== loggedInUser._id)
            : [...post.likes, loggedInUser._id];
        
        setPost({ ...post, likes: newLikes });

        try {
            await api.post(`/posts/${post._id}/like`);
        } catch (error) {
            console.error("Erro ao curtir o post", error);
            setPost(originalPost);
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !loggedInUser) return;
        try {
            const { data: addedComment } = await api.post(`/posts/${postId}/comment`, { text: newComment });
            setComments([...comments, addedComment]);
            setNewComment('');
        } catch (error) {
            console.error("Erro ao adicionar comentário", error);
            alert("Não foi possível publicar seu comentário.");
        }
    };
    
    const handleDelete = async () => {
        if (window.confirm("Tem certeza que deseja deletar este post?")) {
            try {
                await api.delete(`/posts/${postId}`);
                navigate('/');
            } catch (error) {
                console.error("Erro ao deletar o post", error);
                alert("Falha ao deletar o post.");
            }
        }
    };

    if (loading) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Carregando...</p>;
    if (!post) return null;

    const isLikedByMe = loggedInUser ? post.likes.includes(loggedInUser._id) : false;
    const isMyPost = loggedInUser ? loggedInUser._id === post.user?._id : false;
    const formattedTimestamp = formatTimestamp(post.createdAt)?.replace('cerca de ', '');

    return (
      <PageContainer>
        <PostAndCommentsWrapper>
          <PostHeaderMobile>
            <Link to={`/perfil/${post.user?.username || ''}`}>
              <img
                src={post.user?.avatar?.startsWith('http') ? post.user.avatar : `${API_URL}${post.user?.avatar || '/default-avatar.png'}`}
                alt={post.user?.username || 'Usuário'}
              />
            </Link>
            <UserInfoContainer>
                <Link to={`/perfil/${post.user?.username || ''}`}>
                  <strong>{post.user?.username || 'Usuário'}</strong>
                </Link>
                {formattedTimestamp && <Timestamp>{formattedTimestamp}</Timestamp>}
            </UserInfoContainer>
            <HeaderActionsContainer>
                {isMyPost && <DeleteButton onClick={handleDelete}>Deletar</DeleteButton>}
            </HeaderActionsContainer>
          </PostHeaderMobile>
          
          {/* LEGENDA VISÍVEL APENAS NO MOBILE */}
          <MobileViewContainer>
            <CaptionContainer>
                <Legenda ref={captionRef} isExpanded={isExpanded}>
                    {post.caption}
                </Legenda>
                {showReadMore && (
                    <ReadMoreButton onClick={toggleExpanded}>
                        {isExpanded ? 'Ler menos' : 'Ler mais...'}
                    </ReadMoreButton>
                )}
            </CaptionContainer>
          </MobileViewContainer>

          <ImageContainer onDoubleClick={handleLike}>
            <img
              src={post.mediaUrl.startsWith('http') ? post.mediaUrl : `${API_URL}${post.mediaUrl}`}
              alt={post.caption}
            />
            <LikeAnimationIcon className={showAnimation ? 'animate' : ''}>
              <LikedIconPreview />
            </LikeAnimationIcon>
          </ImageContainer>

          <DetailsContainer>
            <PostHeader>
              <PostHeaderTop>
                 <Link to={`/perfil/${post.user?.username || ''}`}>
                    <img
                        src={post.user?.avatar?.startsWith('http') ? post.user.avatar : `${API_URL}${post.user?.avatar || '/default-avatar.png'}`}
                        alt={post.user?.username || 'Usuário'}
                    />
                </Link>
                <UserInfoContainer>
                    <Link to={`/perfil/${post.user.username}`}>
                        <strong>{post.user.username}</strong>
                    </Link>
                    {post.user.profession && <UserRole>{post.user.profession}</UserRole>}
                    {formattedTimestamp && <Timestamp>{formattedTimestamp}</Timestamp>}
                </UserInfoContainer>
                <HeaderActionsContainer>
                    {isMyPost && <DeleteButton onClick={handleDelete}>Deletar</DeleteButton>}
                </HeaderActionsContainer>
              </PostHeaderTop>
            
              {/* LEGENDA AGORA DENTRO DO CABEÇALHO NO DESKTOP */}
              <DesktopViewContainer>
                {post.caption && (
                    <CaptionContainer>
                        <Legenda ref={captionRef} isExpanded={isExpanded}>
                            {post.caption}
                        </Legenda>
                        {showReadMore && (
                            <ReadMoreButton onClick={toggleExpanded}>
                                {isExpanded ? 'Ler menos' : 'Ler mais...'}
                            </ReadMoreButton>
                        )}
                    </CaptionContainer>
                )}
              </DesktopViewContainer>
            </PostHeader>

            <CommentList>
              {comments.map((comment) => (
                comment && comment.author && (
                  <CommentItem key={comment._id}>
                    <img
                      src={comment.author.avatar?.startsWith('http') ? comment.author.avatar : `${API_URL}${comment.author.avatar || '/default-avatar.png'}`}
                      alt={comment.author.username || 'Usuário desconhecido'}
                    />
                    <p>
                      <Link to={`/perfil/${comment.author.username || ''}`}>
                        <strong>{comment.author.username || 'Usuário desconhecido'}</strong>
                      </Link>{' '}
                      {comment.text}
                    </p>
                  </CommentItem>
                )
              ))}
            </CommentList>

            <ActionsWrapper>
              <ActionButtonContainer>
                <ActionButton onClick={handleLike}>
                    {isLikedByMe ? <LikedIcon/> : <HeartIcon />}
                </ActionButton>
                {post.likes.length > 0 && (
                    <CounterBadge>{post.likes.length}</CounterBadge>
                )}
              </ActionButtonContainer>
              <ActionButtonContainer>
                <ActionButton onClick={() => commentInputRef.current?.focus()}>
                    <CommentIcon />
                </ActionButton>
                {comments.length > 0 && (
                    <CounterBadge>{comments.length}</CounterBadge>
                )}
              </ActionButtonContainer>
            </ActionsWrapper>

            <CommentForm onSubmit={handleCommentSubmit}>
              <input
                ref={commentInputRef}
                type="text"
                placeholder="Adicione um comentário..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button type="submit">Publicar</button>
            </CommentForm>
          </DetailsContainer>
        </PostAndCommentsWrapper>
      </PageContainer>
    );
};

export default SinglePostPage;