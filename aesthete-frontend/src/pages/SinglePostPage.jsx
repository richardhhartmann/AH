import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import Post from '../components/Post'; // Reutilizamos o componente Post
import styled from 'styled-components';

const ENDPOINT = process.env.REACT_APP_API_URL;

// --- Styled Components ---

const PageContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 20px;
`;

const CommentsWrapper = styled.div`
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #dbdbdb;
`;

const CommentList = styled.ul`
  list-style: none;
  padding: 0;
  margin-bottom: 20px;
`;

const CommentItem = styled.li`
  margin-bottom: 10px;
  font-size: 0.9rem;
  
  strong {
    margin-right: 8px;
  }
`;

const CommentForm = styled.form`
  display: flex;
  margin-top: 10px;
  
  input {
    flex-grow: 1;
    border: none;
    border-top: 1px solid #dbdbdb;
    padding: 12px;
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
    const [isCommentInputVisible, setIsCommentInputVisible] = useState(false);

    useEffect(() => {
        const fetchPostAndComments = async () => {
            try {
                // Buscamos o post e populamos os usuários dos comentários já existentes
                const { data } = await axios.get(`${ENDPOINT}/api/posts/${postId}?populate=comments.user`);
                setPost(data);
                setComments(data.comments);
            } catch (error) {
                console.error("Erro ao buscar o post", error);
                navigate('/');
            } finally {
                setLoading(false);
            }
        };
        fetchPostAndComments();
    }, [postId, navigate]);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            const config = { headers: { Authorization: `Bearer ${loggedInUser.token}` } };
            const { data: addedComment } = await axios.post(
                `${ENDPOINT}/api/posts/${postId}/comment`,
                { text: newComment },
                config
            );
            
            // Adiciona o novo comentário à lista (UI otimista)
            setComments([...comments, addedComment]);
            setNewComment(''); // Limpa o campo de texto
        } catch (error) {
            console.error("Erro ao adicionar comentário", error);
            alert("Não foi possível publicar seu comentário.");
        }
    };

    const toggleCommentInput = () => {
        setIsCommentInputVisible(prevState => !prevState); 
    };

    if (loading) return <p>Carregando post...</p>;
    if (!post) return null;

    return (
        <PageContainer>
            <div>
                {/* 3. PASSE A FUNÇÃO COMO PROP PARA O COMPONENTE POST */}
                <Post post={post} onCommentClick={toggleCommentInput} />

                <CommentsWrapper>
                    <CommentList>
                        {comments.map((comment, index) => {

                            if (!comment.user) {
                                return (
                                    <CommentItem key={comment._id || index}>
                                        <strong>usuário anônimo</strong>
                                        <span>{comment.text}</span>
                                    </CommentItem>
                                );
                            }

                            return (
                                <CommentItem key={comment._id}>
                                    <Link to={`/perfil/${comment.user.username}`}>
                                        <strong>{comment.user.username}</strong>
                                    </Link>
                                    <span>{comment.text}</span>
                                </CommentItem>
                            );
                        })}
                    </CommentList>
                    
                    {isCommentInputVisible && (
                        <CommentForm onSubmit={handleCommentSubmit}>
                            <input
                                type="text"
                                placeholder="Adicione um comentário..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                autoFocus
                            />
                            <button type="submit">Publicar</button>
                        </CommentForm>
                    )}
                </CommentsWrapper>
            </div>
        </PageContainer>
    );
};

export default SinglePostPage;