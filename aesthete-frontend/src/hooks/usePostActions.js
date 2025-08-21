import { useState, useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { deletePost } from '../features/posts/postSlice';
import api from '../api/axios';

export const usePostActions = (initialPost) => {
    const dispatch = useDispatch();
    const { user: loggedInUser } = useSelector((state) => state.auth);

    const [post, setPost] = useState(initialPost);
    const [isSavedByMe, setIsSavedByMe] = useState(initialPost ? initialPost.isSaved : false);

    // Hooks são chamados no topo, incondicionalmente.
    useEffect(() => {
        setPost(initialPost);
        setIsSavedByMe(initialPost ? initialPost.isSaved : false);
    }, [initialPost]);

    // As funções de callback agora são definidas sem estarem dentro de uma condição.
    const handleLike = useCallback(async () => {
        // A verificação é feita AQUI DENTRO.
        if (!post || !loggedInUser) return;

        const isLiked = post.likes.includes(loggedInUser._id);
        const originalLikes = post.likes;
        const newLikes = isLiked
            ? originalLikes.filter(id => id !== loggedInUser._id)
            : [...originalLikes, loggedInUser._id];
        
        setPost(p => ({ ...p, likes: newLikes }));

        try {
            await api.post(`/posts/${post._id}/like`);
        } catch (error) {
            console.error("Erro ao curtir o post, revertendo.", error);
            setPost(p => ({ ...p, likes: originalLikes }));
        }
    }, [post, loggedInUser]);

    const handleSave = useCallback(async () => {
        if (!post) return; // Verificação interna
        setIsSavedByMe(prev => !prev);

        try {
            await api.put(`/users/save-post/${post._id}`);
        } catch (error) {
            console.error("Erro ao salvar o post, revertendo.", error);
            setIsSavedByMe(prev => !prev);
        }
    }, [post]);

    const handleDelete = useCallback(async () => {
        if (!post) return; // Verificação interna
        if (window.confirm("Tem certeza que deseja deletar este post?")) {
            try {
                dispatch(deletePost(post._id));
            } catch (error) {
                console.error("Erro ao deletar o post", error);
                alert("Não foi possível deletar o post.");
            }
        }
    }, [dispatch, post]);

    // O cálculo das variáveis continua a ser seguro.
    const isMyPost = post ? loggedInUser?._id === post.user._id : false;
    const isLikedByMe = post ? post.likes.includes(loggedInUser?._id) : false;

    return { post, handleLike, handleDelete, isMyPost, isLikedByMe, handleSave, isSavedByMe };
};