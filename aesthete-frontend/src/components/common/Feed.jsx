import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFeedPosts } from '../features/posts/postSlice';
import Post from './Post';
import Spinner from './common/Spinner';

const Feed = () => {
    const dispatch = useDispatch();
    const { feedPosts, loading, error } = useSelector((state) => state.posts);

    useEffect(() => {
        dispatch(fetchFeedPosts());
    }, [dispatch]);

    // Aqui você implementaria a lógica de scroll infinito
    // com um custom hook (useInfiniteScroll) que detecta o fim da página
    // e dispara uma nova action do Redux para buscar mais posts (`fetchMoreFeedPosts`).

    if (loading) return <Spinner />;
    if (error) return <p>Ocorreu um erro ao carregar o feed.</p>;

    return (
        <div>
            {feedPosts.map((post) => (
                <Post key={post._id} post={post} />
            ))}
        </div>
    );
};

export default Feed;