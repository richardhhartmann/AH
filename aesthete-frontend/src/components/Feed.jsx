import React, { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFeedPosts, resetFeed } from '../features/posts/postSlice';
import Post from './Post';
import Spinner from './common/Spinner';

const EmptyFeedMessage = () => (
    <div style={{ textAlign: 'center', color: '#8e8e8e', marginTop: '50px' }}>
        <h2>Seu feed está vazio</h2>
        <p>Siga outros usuários para ver as publicações deles aqui.</p>
    </div>
);

const Feed = () => {
    const dispatch = useDispatch();

    const { 
        feedPosts, 
        status, 
        hasMore, 
        page 
    } = useSelector((state) => ({
        feedPosts: state.posts.feedPosts,
        status: state.posts.feedStatus,
        hasMore: state.posts.feedHasMore,
        page: state.posts.feedPage,
    }));

    const observer = useRef();
    const lastPostElementRef = useCallback(node => {
        if (status === 'loading') return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                dispatch(fetchFeedPosts({ page, limit: 5 }));
            }
        });
        if (node) observer.current.observe(node);
    }, [status, hasMore, dispatch, page]);

    useEffect(() => {
        // Apenas busca os dados se o feed estiver no estado inicial
        if (status === 'idle') {
            dispatch(fetchFeedPosts({ page: 1, limit: 5 }));
        }
        return () => {
            dispatch(resetFeed());
        };
    }, [dispatch]); // Removido 'status' para evitar re-fetches indesejados

    // Filtra os posts válidos para renderização
    const postsToRender = feedPosts.filter(post => post && post.user);

    // 1. Estado de Carregamento Inicial
    if (status === 'loading' && postsToRender.length === 0) {
        return <Spinner />;
    }

    // 2. Estado Vazio (Após a busca ter sucesso e não encontrar nada)
    if (status === 'succeeded' && postsToRender.length === 0) {
        return <EmptyFeedMessage />;
    }
    
    // 3. Renderização Principal dos Posts
    return (
        <div>
            {postsToRender.map((post, index) => {
                if (postsToRender.length === index + 1) {
                    return <Post ref={lastPostElementRef} key={post._id} post={post} />;
                } else {
                    return <Post key={post._id} post={post} />;
                }
            })}

            {/* Spinner para as próximas páginas */}
            {status === 'loading' && postsToRender.length > 0 && <Spinner />}

            {!hasMore && postsToRender.length > 0 && (
                <p style={{ textAlign: 'center', margin: '20px 0' }}>Você chegou ao fim!</p>
            )}
        </div>
    );
};

export default Feed;