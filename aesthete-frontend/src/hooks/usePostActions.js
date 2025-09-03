import { useState, useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { deletePost } from '../features/posts/postSlice';
import api from '../api/axios';

export const usePostActions = (initialPost) => {
    const dispatch = useDispatch();
    const { user: loggedInUser } = useSelector((state) => state.auth);

    const [post, setPost] = useState(initialPost);
    // Corrigido: O estado inicial de isSavedByMe agora vem diretamente da propriedade do post.
    const [isSavedByMe, setIsSavedByMe] = useState(initialPost?.isSaved || false);

    useEffect(() => {
        setPost(initialPost);
        // Garante que o estado 'isSaved' seja atualizado se o post inicial mudar.
        setIsSavedByMe(initialPost?.isSaved || false);
    }, [initialPost]);

    const handleLike = useCallback(async () => {
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
        if (!post) return;
        
        // Atualiza o estado visual imediatamente
        setIsSavedByMe(prev => !prev);

        try {
            // Envia a requisição para o backend
            await api.put(`/users/save-post/${post._id}`);
        } catch (error) {
            console.error("Erro ao salvar o post, revertendo.", error);
            // Reverte o estado visual em caso de erro
            setIsSavedByMe(prev => !prev);
        }
    }, [post]);

    const handleDelete = useCallback(async () => {
        if (!post) return;
        if (window.confirm("Tem certeza que deseja deletar este post?")) {
            try {
                dispatch(deletePost(post._id));
            } catch (error) {
                console.error("Erro ao deletar o post", error);
                alert("Não foi possível deletar o post.");
            }
        }
    }, [dispatch, post]);

    const isMyPost = post ? loggedInUser?._id === post.user._id : false;
    const isLikedByMe = post ? post.likes.includes(loggedInUser?._id) : false;

    return { post, handleLike, handleDelete, isMyPost, isLikedByMe, handleSave, isSavedByMe };
};