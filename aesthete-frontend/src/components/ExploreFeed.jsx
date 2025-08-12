import React, { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchExplorePosts, resetExplore } from '../features/posts/postSlice';
import Post from './Post';
import Spinner from './common/Spinner';

const EmptyExploreMessage = () => (
    <div style={{ textAlign: 'center', color: '#8e8e8e', marginTop: '50px' }}>
        <h2>Nada para explorar</h2>
        <p>Ainda não há publicações para explorar.</p>
    </div>
);

const ExploreFeed = () => {
    const dispatch = useDispatch();

    const { 
        posts, 
        status, 
        hasMore, 
        page 
    } = useSelector((state) => ({
        posts: state.posts.explorePosts,
        status: state.posts.exploreStatus,
        hasMore: state.posts.exploreHasMore,
        page: state.posts.explorePage,
    }));

    const observer = useRef();
    const lastPostElementRef = useCallback(node => {
        if (status === 'loading') return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                dispatch(fetchExplorePosts({ page, limit: 15 }));
            }
        });
        if (node) observer.current.observe(node);
    }, [status, hasMore, dispatch, page]);

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchExplorePosts({ page: 1, limit: 15 }));
        }
        return () => {
            dispatch(resetExplore());
        };
    }, [dispatch]);

    const postsToRender = posts.filter(post => post && post.user);

    if (status === 'loading' && postsToRender.length === 0) {
        return <Spinner />;
    }

    if (status === 'succeeded' && postsToRender.length === 0) {
        return <EmptyExploreMessage />;
    }

    return (
        <div>
            {/* O Explorar pode ser renderizado em múltiplas colunas, mas por simplicidade vamos manter uma */}
            {postsToRender.map((post, index) => {
                if (postsToRender.length === index + 1) {
                    return <Post ref={lastPostElementRef} key={post._id} post={post} />;
                } else {
                    return <Post key={post._id} post={post} />;
                }
            })}
            {status === 'loading' && <Spinner />}
            {!hasMore && postsToRender.length > 0 && (
                <p style={{ textAlign: 'center', margin: '20px 0' }}>Você chegou ao fim!</p>
            )}
        </div>
    );
};

export default ExploreFeed;