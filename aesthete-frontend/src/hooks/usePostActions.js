// src/hooks/usePostActions.js
import { useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { deletePost } from '../features/posts/postSlice'; // Importa a nova action
import api from '../api/axios';

export const usePostActions = (initialPost) => {
    const dispatch = useDispatch();
    const { user: loggedInUser } = useSelector((state) => state.auth);

    const [post, setPost] = useState(initialPost);

    const isMyPost = loggedInUser?._id === post.user._id;
    const isLikedByMe = post.likes.includes(loggedInUser?._id);

    const handleLike = useCallback(async () => {
        const originalLikes = post.likes;
        const newLikes = isLikedByMe
            ? originalLikes.filter(id => id !== loggedInUser._id)
            : [...originalLikes, loggedInUser._id];
        
        setPost(p => ({ ...p, likes: newLikes })); // Atualização otimista da UI

        try {
            await api.post(`/posts/${post._id}/like`);
        } catch (error) {
            console.error("Erro ao curtir o post, revertendo.", error);
            setPost(p => ({ ...p, likes: originalLikes })); // Reverte em caso de erro
        }
    }, [post, isLikedByMe, loggedInUser?._id]);

    const handleDelete = useCallback(async () => {
        if (window.confirm("Tem certeza que deseja deletar este post?")) {
            try {
                // Dispara a action do Redux para deletar o post
                dispatch(deletePost(post._id));
            } catch (error) {
                console.error("Erro ao deletar o post", error);
                alert("Não foi possível deletar o post.");
            }
        }
    }, [dispatch, post._id]);

    return { post, handleLike, handleDelete, isMyPost, isLikedByMe };
};