import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api, { API_URL } from '../api/axios';
import styled from 'styled-components';

// --- Ícones ---
// (Você pode precisar instalar react-icons se ainda não tiver: npm install react-icons)
import { FaHeart, FaRegHeart } from 'react-icons/fa'; // Ícones de coração

// --- Styled Components (com adições) ---

const PageContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 20px;
  background-color: #fafafa;
`;

const PostAndCommentsWrapper = styled.div`
  display: flex;
  background-color: #fff;
  border: 1px solid #dbdbdb;
  border-radius: 8px;
  overflow: hidden;
  max-width: 935px;
  width: 100%;
  
  @media (max-width: 768px) {
    flex-direction: column;
    border: none;
    border-radius: 0;
  }
`;

const ImageContainer = styled.div`
  flex: 1.5;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;

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
`;

const PostHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid #dbdbdb;
  flex-shrink: 0;

  img {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    margin: 0 auto 8px auto; /* centraliza e afasta da info abaixo */
  }

  a {
    text-decoration: none;
    color: #000;
    font-weight: bold;
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
    border-radius: 50%;
    margin-right: 12px;
  }

  p {
    word-break: break-word;
  }
`;

// --- NOVOS STYLED COMPONENTS PARA AÇÕES E CURTIDAS ---
const ActionsWrapper = styled.div`
  padding: 8px 16px;
  border-top: 1px solid #dbdbdb;
  flex-shrink: 0;
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

const LikesCounter = styled.p`
  font-size: 0.9rem;
  font-weight: bold;
  padding: 0 16px 8px;
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
    color: #0095f6;
    font-weight: bold;
    cursor: pointer;
  }
`;

// --- Componente ---
const SinglePostPage = () => {
    const { postId } = useParams();
    const navigate = useNavigate();
    const { user: loggedInUser } = useSelector((state) => state.auth);

    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);

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

    // --- LÓGICA PARA CURTIR O POST ---
    const handleLike = async () => {
        if (!post || !loggedInUser) return;

        const originalPost = { ...post };
        const isAlreadyLiked = post.likes.includes(loggedInUser._id);

        // Atualização Otimista
        const newLikes = isAlreadyLiked
            ? post.likes.filter(id => id !== loggedInUser._id)
            : [...post.likes, loggedInUser._id];
        
        setPost({ ...post, likes: newLikes });

        try {
            await api.post(`/posts/${post._id}/like`);
        } catch (error) {
            console.error("Erro ao curtir o post", error);
            setPost(originalPost); // Reverte em caso de erro
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

    if (loading) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Carregando...</p>;
    if (!post) return null;

    const isLikedByMe = loggedInUser ? post.likes.includes(loggedInUser._id) : false;

    return (
        <PageContainer>
            <PostAndCommentsWrapper>
                <ImageContainer>
                    <img src={post.mediaUrl.startsWith('http') ? post.mediaUrl : `${API_URL}${post.mediaUrl}`} alt={post.caption} />
                </ImageContainer>
                <DetailsContainer>
                    
                    <CommentList>
                        {post.caption && (
                            <CommentItem>
                                {post.user && (
                                  <img
                                    src={post.user?.avatar?.startsWith('http') ? post.user.avatar : `${API_URL}${post.user?.avatar || '/default-avatar.png'}`}
                                    alt={post.user?.username || 'Usuário'} 
                                  />
                                )}
                                <p>
                                    <Link to={`/perfil/${post.user?.username || ''}`}>
                                      <strong>{post.user?.username || 'Usuário'}</strong>
                                    </Link>
                                    {' '}{post.caption}
                                </p>
                            </CommentItem>
                        )}
                        
                        {comments.map((comment) => (
                          comment && ( 
                              <CommentItem key={comment._id}>
                                  <img 
                                      src={comment.author?.avatar?.startsWith('http') ? comment.author.avatar : `${API_URL}${comment.author.avatar}`} 
                                      alt={comment.author?.username || 'Usuário desconhecido'} 
                                  />
                                  <p>
                                      <Link to={`/perfil/${comment.author?.username}`}>
                                          <strong>{comment.author?.username || 'Usuário desconhecido'}</strong>
                                      </Link>
                                      {' '}{comment.text}
                                  </p>
                              </CommentItem>
                          )
                      ))}
                    </CommentList>

                    <ActionsWrapper>
                        <ActionButton onClick={handleLike}>
                            {isLikedByMe ? <FaHeart color="red" /> : <FaRegHeart />}
                        </ActionButton>
                    </ActionsWrapper>
                    <LikesCounter>
                        {post.likes.length} curtidas
                    </LikesCounter>
                    
                    <CommentForm onSubmit={handleCommentSubmit}>
                        <input
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