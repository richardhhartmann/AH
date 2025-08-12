import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import api, { API_URL } from '../api/axios';

// --- Styled Components (pode reutilizar estilos da sua SinglePostPage) ---
const CommentsWrapper = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const CommentList = styled.ul`
  list-style: none;
  padding: 0;
  flex-grow: 1;
  overflow-y: auto;
  margin-bottom: 16px;
`;

const CommentItem = styled.li`
  margin-bottom: 12px;
  font-size: 0.9rem;
  line-height: 1.4;
  display: flex;
  align-items: center;

  img {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    margin-right: 10px;
  }
`;

const CommentForm = styled.form`
  display: flex;
  border-top: 1px solid #dbdbdb;
  padding-top: 10px;

  input {
    flex-grow: 1;
    border: none;
    outline: none;
    padding: 8px;
  }
  button {
    background: none;
    border: none;
    color: #0095f6;
    font-weight: bold;
    cursor: pointer;
  }
`;

const CommentsSection = ({ postId, onCommentAdded }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        // Assumindo que você tem um endpoint que retorna os comentários de um post
        // Se não, você pode buscar o post inteiro e pegar `data.comments`
        const { data } = await api.get(`/posts/${postId}`);
        setComments(data.comments || []);
      } catch (error) {
        console.error("Erro ao buscar comentários", error);
      } finally {
        setLoading(false);
      }
    };
    if (postId) {
      fetchComments();
    }
  }, [postId]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const { data: addedComment } = await api.post(`/posts/${postId}/comment`, { text: newComment });
      setComments([...comments, addedComment]);
      setNewComment('');
      
      if (onCommentAdded) {
        onCommentAdded(addedComment);
      }

    } catch (error) {
      console.error("Erro ao adicionar comentário", error);
      alert("Não foi possível publicar seu comentário.");
    }
  };

  if (loading) return <p>Carregando comentários...</p>;

  return (
    <CommentsWrapper>
      <CommentList>
        {comments.map((comment) => (
          <CommentItem key={comment._id}>
            <img src={comment.author.avatar.startsWith('http') ? comment.author.avatar : `${API_URL}${comment.author.avatar}`} alt={comment.author.username} />
            <p>
              <strong>{comment.author.username}</strong> {comment.text}
            </p>
          </CommentItem>
        ))}
        {comments.length === 0 && <p>Nenhum comentário ainda.</p>}
      </CommentList>
      <CommentForm onSubmit={handleCommentSubmit}>
        <input
          type="text"
          placeholder="Adicione um comentário..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button type="submit">Publicar</button>
      </CommentForm>
    </CommentsWrapper>
  );
};

export default CommentsSection;