import React, { useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';

// --- Styled Components ---

const PostContainer = styled.div`
  background-color: #fff;
  border: 1px solid #dbdbdb;
  border-radius: 8px;
  margin-bottom: 24px;
  max-width: 615px; /* Define uma largura máxima para o post */
`;

const PostHeader = styled.div`
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

const DeleteButton = styled.button`
    background: none;
    border: none;
    color: #ed4956;
    font-weight: bold;
    cursor: pointer;
    margin-left: auto; /* Joga o botão para a direita */
    font-size: 0.9rem;
`;

const PostImage = styled.img`
  width: 100%;
  height: auto;
  object-fit: cover;
  border-top: 1px solid #dbdbdb;
  border-bottom: 1px solid #dbdbdb;
`;

const PostActions = styled.div`
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

const PostFooter = styled.div`
  padding: 0 16px 16px;
  font-size: 0.9rem;
  
  p {
    margin-bottom: 4px;
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

const HeartIcon = () => (
  <svg aria-label="Curtir" fill="currentColor" role="img" viewBox="0 0 24 24">
    <path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-6.12 8.42a18.108 18.108 0 0 1-2.38 2.088 3.744 3.744 0 0 1-2.991 0 18.108 18.108 0 0 1-2.38-2.088c-3.468-3.461-6.12-5.348-6.12-8.42a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.118-1.763a4.21 4.21 0 0 1 3.675-1.941z"></path>
  </svg>
);

const LikedIcon = () => (
  <svg aria-label="Descurtir" fill="#ed4956" role="img" viewBox="0 0 48 48">
    <path d="M34.6 3.9c-4.2 0-7.9 2.1-10.6 5.6-2.7-3.5-6.4-5.6-10.6-5.6C6 3.9 0 9.9 0 17.6 0 28.3 10.3 38.5 24 44.2 37.7 38.5 48 28.3 48 17.6c0-7.7-6-13.7-13.4-13.7z"></path>
  </svg>
);

const Post = ({ post: initialPost, onCommentClick }) => {
  const { user: loggedInUser } = useSelector((state) => state.auth);
  
  const [post, setPost] = useState(initialPost);

  const isLikedByMe = post.likes.includes(loggedInUser?._id);
  const isMyPost = loggedInUser?._id === post.user._id;

  const handleLike = async () => {
    try {
        const newLikes = isLikedByMe
            ? post.likes.filter(id => id !== loggedInUser._id)
            : [...post.likes, loggedInUser._id];
        
        setPost({ ...post, likes: newLikes });

        const config = { headers: { Authorization: `Bearer ${loggedInUser.token}` } };
        await axios.post(`http://localhost:5000/api/posts/${post._id}/like`, {}, config);
    } catch (error) {
        console.error("Erro ao curtir o post", error);
        setPost(initialPost);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Tem certeza que deseja deletar este post?")) {
        try {
            const config = { headers: { Authorization: `Bearer ${loggedInUser.token}` } };
            await axios.delete(`http://localhost:5000/api/posts/${post._id}`, config);
            alert("Post deletado com sucesso!");
            window.location.reload(); 
        } catch (error) {
            console.error("Erro ao deletar o post", error);
            alert("Não foi possível deletar o post.");
        }
    }
  };

  if (!post || !post.user) return null;

  return (
    <PostContainer>
      <PostHeader>
        <Link to={`/perfil/${post.user.username}`}>
          <img src={`http://localhost:5000${post.user.avatar}`} alt={post.user.username} />
        </Link>
        <Link to={`/perfil/${post.user.username}`}>
          <strong>{post.user.username}</strong>
        </Link>
        {isMyPost && <DeleteButton onClick={handleDelete}>Deletar</DeleteButton>}
      </PostHeader>

      <Link to={`/post/${post._id}`}>
        <PostImage src={`http://localhost:5000${post.mediaUrl}`} alt={post.caption} />
      </Link>
      
      <PostActions>
        <button onClick={handleLike}>
          {isLikedByMe ? <LikedIcon /> : <HeartIcon />}
        </button>
        <button onClick={onCommentClick}>
            <svg aria-label="Comentar" fill="currentColor" role="img" viewBox="0 0 24 24"><path d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"></path></svg>
        </button>
      </PostActions>

      <PostFooter>
        <p><strong>{post.likes.length} curtidas</strong></p>
        <p>
          <Link to={`/perfil/${post.user.username}`}>
            <strong>{post.user.username}</strong>
          </Link>
          {' '}{post.caption}
        </p>
        <Link to={`/post/${post._id}`}>
            <span>Ver todos os {post.comments.length} comentários</span>
        </Link>
      </PostFooter>
    </PostContainer>
  );
};

export default Post;