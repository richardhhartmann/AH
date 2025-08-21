import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api, { API_URL } from '../api/axios';
import styled, { keyframes, css } from 'styled-components';
import { HeartIcon, LikedIcon, LikedIconPreview, CommentIcon, SaveIcon, SavedIcon } from '../components/Icons';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { usePostActions } from '../hooks/usePostActions';
import useMediaQuery from '../hooks/useMediaQuery';
import CommentsModal from '../components/CommentsModal';

// --- Styled Components (sem alterações) ---

const likeAnimation = keyframes`
  0% { opacity: 0; transform: scale(0.1); }
  50% { opacity: 1; transform: scale(1.2); }
  100% { opacity: 0; transform: scale(1); }
`;

const LikeAnimationIcon = styled.div`
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; opacity: 0; pointer-events: none;
  &.animate { animation: ${likeAnimation} 0.8s ease-in-out; }
  svg { width: 80px; height: 80px; filter: drop-shadow(0 0 5px rgba(0,0,0,0.5)); }
`;

const DesktopPageContainer = styled.div`
  display: flex; justify-content: center; align-items: center; padding: 20px; background-color: #fafafa;
`;

const PostAndCommentsWrapper = styled.div`
  display: flex; background-color: #fff; border: 1px solid #dbdbdb; border-radius: 8px; overflow: hidden; max-width: 935px; width: 100%; max-height: 90vh;
`;

const MediaContainer = styled.div`
  flex: 1.5; background-color: #000; display: flex; align-items: center; justify-content: center; position: relative; cursor: pointer;
  img, video { max-width: 100%; max-height: 100%; object-fit: contain; }
`;

const DetailsContainer = styled.div`
  flex: 1; display: flex; flex-direction: column; min-width: 300px;
`;

const PostHeader = styled.div`
  display: flex; align-items: center; padding: 14px 16px; border-bottom: 1px solid #dbdbdb;
  img { width: 32px; height: 32px; border-radius: 50%; margin-right: 12px; }
  a { text-decoration: none; color: #000; font-weight: bold; }
`;

const CommentList = styled.ul`
  list-style: none; padding: 16px; flex-grow: 1; overflow-y: auto;
`;

const CommentItem = styled.li`
  margin-bottom: 16px; font-size: 0.9rem; display: flex; align-items: flex-start;
  img { width: 32px; height: 32px; border-radius: 50%; margin-right: 12px; }
  p { word-break: break-word; }
`;

const ActionsWrapper = styled.div`
  display: flex; padding: 4px 8px; border-top: 1px solid #dbdbdb;
`;

const ActionButtonContainer = styled.div`
    position: relative; display: flex; align-items: center;
`;

const ActionButton = styled.button`
  background: none; border: none; cursor: pointer; padding: 8px;
  svg { width: 24px; height: 24px; }
`;

const CounterBadge = styled.span`
  position: absolute; top: 0; right: 0; background-color: rgb(254, 121, 13); color: white; font-size: 0.6rem; border-radius: 50%; width: 16px; height: 16px; display: flex; align-items: center; justify-content: center;
`;

const CarouselButton = styled.button`
  position: absolute; top: 50%; transform: translateY(-50%); ${props => props.left ? 'left: 10px;' : 'right: 10px;'}
  background-color: rgba(255, 255, 255, 0.7); border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 10;
`;

const CarouselDots = styled.div`
  position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%); display: flex; gap: 5px;
`;

const Dot = styled.span`
  width: 6px; height: 6px; border-radius: 50%; background-color: ${props => props.active ? 'rgb(254, 121, 13)' : 'rgba(255, 255, 255, 0.7)'};
`;

const CommentForm = styled.form`
  display: flex; padding: 10px; border-top: 1px solid #dbdbdb;
  input { flex-grow: 1; border: none; padding: 8px; outline: none; }
  button { background: none; border: none; color: rgb(254, 121, 13); font-weight: bold; cursor: pointer; }
`;

const MobileFeedContainer = styled.div`
  width: 100vw;
  height: calc(100vh - 60px);
  overflow-y: auto;
  background-color: #fff;
  scroll-snap-type: y mandatory;
`;

const MobilePostWrapper = styled.div`
  width: 100%;
  height: calc(100vh - 60px); 
  display: flex;
  flex-direction: column;
  position: relative;
  background-color: #fff;
  border-bottom: 1px solid #dbdbdb;
  scroll-snap-align: start;
`;

const MobileHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 14px 16px;
  flex-shrink: 0; 
  img {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    margin-right: 14px;
    object-fit: cover;
  }
`;

const UserInfoContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    line-height: 1.3;
    strong { font-size: 1.1rem; }
`;

const UserRole = styled.span`
    font-size: 0.75rem;
    font-weight: bold;
    color: rgb(254, 121, 13);
`;

const Timestamp = styled.span`
    font-size: 0.7rem;
    color: #313131ff;
    margin-top: 1px;
`;

const MobileMediaContainer = styled.div`
    position: relative; 
    display: flex; 
    align-items: center; 
    justify-content: center; 
    width: 100%; 
    background-color: #000;
    flex-grow: 1;
    overflow: hidden;

    img, video { 
        width: 100%; 
        height: 100%;
        object-fit: contain; 
    }
`;

const MobileActionsBelowMedia = styled.div`
    display: flex; align-items: center; padding: 4px; pointer-events: auto; flex-shrink: 0;
`;

const MobileCaptionContainer = styled.div`
  padding: 8px 16px 8px;
  flex-shrink: 0;
`;

const Legenda = styled.p`
  font-size: 0.9rem;
  word-wrap: break-word;
  margin: 0;

  ${({ isExpanded }) => !isExpanded && css`
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  `}
`;

const ReadMoreButton = styled.strong`
  font-size: 0.9rem;  
  display: inline-block;
  font-weight: bold;
  color: #8e8e8e;
  cursor: pointer;
  margin-top: 4px;
`;

const ViewCommentsLink = styled.p`
  color: #8e8e8e;
  cursor: pointer;
  margin: 4px 0;
  padding: 0 16px 12px;
  font-size: 0.9rem;
  flex-shrink: 0;
`;

const getImageUrl = (url) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `${API_URL}${url}`;
};

const formatTimestamp = (date) => {
    if (!date) return '';
    try {
        const formatted = formatDistanceToNow(new Date(date), { addSuffix: true, locale: ptBR });
        return formatted.replace('cerca de ', '');
    } catch (error) {
        return null;
    }
};

const PostItem = ({ postData, isVisible, profileUser, onCommentAdded }) => { // Recebe onCommentAdded
    const { 
        post, handleLike, handleSave, isLikedByMe, isSavedByMe 
    } = usePostActions(postData);
    
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
    
    const [isExpanded, setIsExpanded] = useState(false);
    const [showReadMore, setShowReadMore] = useState(false);
    const captionRef = useRef(null);

    useEffect(() => {
        const element = captionRef.current;
        if (element && element.scrollHeight > element.clientHeight) {
            setShowReadMore(true);
        } else {
            setShowReadMore(false);
        }
    }, [post.caption]);
    
    const toggleExpanded = () => setIsExpanded(prev => !prev);

    const nextMedia = (e) => { e.stopPropagation(); setCurrentMediaIndex(prev => (prev + 1) % post.media.length); };
    const prevMedia = (e) => { e.stopPropagation(); setCurrentMediaIndex(prev => (prev - 1 + post.media.length) % post.media.length); };

    if (!post || !profileUser) return <div style={{width: '100%', height: '100%', background: '#eee'}}></div>;
    
    const currentMedia = post.media[currentMediaIndex];
    const formattedTimestamp = formatTimestamp(post.createdAt);

    return (
        <>
            <MobilePostWrapper>
                <MobileHeader>
                    <Link to={`/perfil/${profileUser.username}`}>
                        <img src={getImageUrl(profileUser.avatar)} alt={profileUser.username} />
                    </Link>
                    <UserInfoContainer>
                        <Link to={`/perfil/${profileUser.username}`}>
                            <strong>{profileUser.username}</strong>
                        </Link>
                        {profileUser.profession && <UserRole>{profileUser.profession}</UserRole>}
                        {formattedTimestamp && <Timestamp>{formattedTimestamp}</Timestamp>}
                    </UserInfoContainer>
                </MobileHeader>
                
                {post.caption && (
                    <MobileCaptionContainer>
                        <Legenda ref={captionRef} isExpanded={isExpanded}>
                           {post.caption}
                        </Legenda>
                        {showReadMore && (
                            <ReadMoreButton onClick={toggleExpanded}>
                                {isExpanded ? 'menos' : 'mais'}
                            </ReadMoreButton>
                        )}
                    </MobileCaptionContainer>
                )}

                <MobileMediaContainer>
                    {currentMedia.mediaType === 'image' ? (
                        <img src={getImageUrl(currentMedia.url)} alt={post.caption} />
                    ) : (
                        <video src={getImageUrl(currentMedia.url)} controls={false} autoPlay={isVisible} muted loop playsInline />
                    )}
                    {post.media.length > 1 && (
                        <>
                            <CarouselButton left onClick={prevMedia}><FaChevronLeft /></CarouselButton>
                            <CarouselButton right onClick={nextMedia}><FaChevronRight /></CarouselButton>
                            <CarouselDots>
                                {post.media.map((_, index) => <Dot key={index} active={index === currentMediaIndex} />)}
                            </CarouselDots>
                        </>
                    )}
                </MobileMediaContainer>
                
                <MobileActionsBelowMedia>
                    <ActionButtonContainer>
                        <ActionButton onClick={handleLike}>
                            {isLikedByMe ? <LikedIcon /> : <HeartIcon />}
                        </ActionButton>
                        {post.likes.length > 0 && <CounterBadge>{post.likes.length}</CounterBadge>}
                    </ActionButtonContainer>
                    
                    <ActionButtonContainer>
                        <ActionButton onClick={() => setIsCommentsModalOpen(true)}>
                            <CommentIcon />
                        </ActionButton>
                        {post.comments?.length > 0 && <CounterBadge>{post.comments.length}</CounterBadge>}
                    </ActionButtonContainer>
                    
                    <ActionButtonContainer style={{ marginLeft: 'auto' }}>
                        <ActionButton onClick={handleSave}>
                            {isSavedByMe ? <SavedIcon /> : <SaveIcon />}
                        </ActionButton>
                    </ActionButtonContainer>
                </MobileActionsBelowMedia>

                {post.comments?.length > 0 && (
                  <ViewCommentsLink onClick={() => setIsCommentsModalOpen(true)}>
                    {post.comments.length === 1
                      ? "Ver comentário"
                      : `Ver todos os ${post.comments.length} comentários`}
                  </ViewCommentsLink>
                )}
            </MobilePostWrapper>
            
            <CommentsModal 
                isOpen={isCommentsModalOpen} 
                onClose={() => setIsCommentsModalOpen(false)} 
                postId={post._id}
                onCommentAdded={onCommentAdded} // Passa a função para o Modal
            />
        </>
    );
};


const SinglePostPage = () => {
    const { postId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const isMobile = useMediaQuery('(max-width: 768px)');

    const [userPosts, setUserPosts] = useState(location.state?.userPosts || []);
    const [currentPostIndex, setCurrentPostIndex] = useState(location.state?.postIndex ?? 0);
    const [profileUser, setProfileUser] = useState(location.state?.profileUser || null);
    const [singlePostData, setSinglePostData] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const targetPostRef = useRef(null);

    // --- NOVA FUNÇÃO PARA ATUALIZAR O POST NO MOBILE ---
    const handleMobileCommentAdded = (postId, newComment) => {
        setUserPosts(currentPosts => 
            currentPosts.map(p => 
                p._id === postId
                ? { ...p, comments: [...p.comments, newComment] }
                : p
            )
        );
    };

    // --- NOVA FUNÇÃO PARA ATUALIZAR O POST NO DESKTOP ---
    const handleDesktopCommentAdded = (newComment) => {
        setSinglePostData(currentData => ({
            ...currentData,
            comments: [...currentData.comments, newComment]
        }));
    };

    useEffect(() => {
        if (isMobile && location.state?.userPosts) {
            setUserPosts(location.state.userPosts);
            setCurrentPostIndex(location.state.postIndex);
            setProfileUser(location.state.profileUser);
            setLoading(false);
        } else {
            const fetchPost = async () => {
                setLoading(true);
                try {
                    const { data } = await api.get(`/posts/${postId}`);
                    setSinglePostData(data);
                } catch (error) {
                    console.error("Erro ao buscar o post", error);
                    navigate('/');
                } finally {
                    setLoading(false);
                }
            };
            fetchPost();
        }
    }, [postId, navigate, isMobile, location.state]);

    useEffect(() => {
        if (targetPostRef.current) {
            targetPostRef.current.scrollIntoView({ behavior: 'instant' });
        }
    }, [loading]);

    if (loading) {
        return <p style={{ textAlign: 'center', marginTop: '50px' }}>A carregar...</p>;
    }

    if (isMobile && userPosts.length > 0) {
        return (
            <MobileFeedContainer>
              {userPosts.map((post, index) => {
                  const author = (post.user && post.user.username) ? post.user : profileUser;
                  return (
                      <div 
                        key={post._id} 
                        ref={index === currentPostIndex ? targetPostRef : null}
                      >
                          <PostItem 
                            postData={post} 
                            isVisible={index === currentPostIndex} 
                            profileUser={author}
                            onCommentAdded={(newComment) => handleMobileCommentAdded(post._id, newComment)} // Passa a função para o PostItem
                          />
                      </div>
                  );
              })}
          </MobileFeedContainer>
        );
    }
    
    if (!singlePostData) {
        return <p style={{ textAlign: 'center', marginTop: '50px' }}>Publicação não encontrada.</p>;
    }
    
    const DesktopView = ({ onCommentAdded }) => { // Recebe onCommentAdded
        const { post, handleLike, handleDelete, handleSave, isMyPost, isLikedByMe, isSavedByMe } = usePostActions(singlePostData);
        const [comments, setComments] = useState(singlePostData.comments || []);
        const [newComment, setNewComment] = useState('');
        const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
        const [showAnimation, setShowAnimation] = useState(false);
        const animationTimeoutRef = useRef(null);
        const commentInputRef = useRef(null);
        
        useEffect(() => { return () => clearTimeout(animationTimeoutRef.current); }, []);

        const triggerLikeAnimation = () => {
            if (!isLikedByMe) {
                setShowAnimation(true);
                animationTimeoutRef.current = setTimeout(() => setShowAnimation(false), 800);
            }
            handleLike();
        };

        const handleCommentSubmit = async (e) => {
            e.preventDefault();
            if (!newComment.trim()) return;
            try {
                const { data } = await api.post(`/posts/${postId}/comment`, { text: newComment });
                setComments(prev => [...prev, data]); // Atualiza a lista local
                onCommentAdded(data); // Chama a função do pai para atualizar o estado global
                setNewComment('');
            } catch (error) { console.error("Erro ao adicionar comentário", error); }
        };

        const nextMedia = (e) => { e.stopPropagation(); setCurrentMediaIndex(prev => (prev + 1) % post.media.length); };
        const prevMedia = (e) => { e.stopPropagation(); setCurrentMediaIndex(prev => (prev - 1 + post.media.length) % post.media.length); };
        
        if (!post) return null;
        const currentMedia = post.media[currentMediaIndex];

        return (
            <DesktopPageContainer>
                 <PostAndCommentsWrapper>
                    <MediaContainer onDoubleClick={triggerLikeAnimation}>
                        {currentMedia.mediaType === 'image' ? (
                            <img src={getImageUrl(currentMedia.url)} alt={post.caption} />
                        ) : (
                            <video src={getImageUrl(currentMedia.url)} controls autoPlay muted loop />
                        )}
                        <LikeAnimationIcon className={showAnimation ? 'animate' : ''}><LikedIconPreview /></LikeAnimationIcon>
                        {post.media.length > 1 && (
                            <>
                                <CarouselButton left onClick={prevMedia}><FaChevronLeft /></CarouselButton>
                                <CarouselButton right onClick={nextMedia}><FaChevronRight /></CarouselButton>
                                <CarouselDots>
                                    {post.media.map((_, index) => <Dot key={index} active={index === currentMediaIndex} />)}
                                </CarouselDots>
                            </>
                        )}
                    </MediaContainer>
                    <DetailsContainer>
                        <PostHeader>
                            <img src={getImageUrl(post.user.avatar)} alt={post.user.username} />
                            <Link to={`/perfil/${post.user.username}`}>{post.user.username}</Link>
                            {isMyPost && <button onClick={handleDelete} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'red', cursor: 'pointer' }}><strong>Deletar</strong></button>}
                        </PostHeader>
                        <CommentList>
                            {post.caption && (
                                <CommentItem>
                                    <img src={getImageUrl(post.user.avatar)} alt={post.user.username} />
                                    <p><Link to={`/perfil/${post.user.username}`}><strong>{post.user.username}</strong></Link> {post.caption}</p>
                                </CommentItem>
                            )}
                            {comments.map((comment) => (
                                <CommentItem key={comment._id}>
                                    <img src={getImageUrl(comment.author.avatar)} alt={comment.author.username} />
                                    <p><Link to={`/perfil/${comment.author.username}`}><strong>{comment.author.username}</strong></Link> {comment.text}</p>
                                </CommentItem>
                            ))}
                        </CommentList>
                        <ActionsWrapper>
                            <ActionButtonContainer>
                                <ActionButton onClick={triggerLikeAnimation}>{isLikedByMe ? <LikedIcon /> : <HeartIcon />}</ActionButton>
                                {post.likes.length > 0 && <CounterBadge>{post.likes.length}</CounterBadge>}
                            </ActionButtonContainer>
                            <ActionButtonContainer>
                                <ActionButton onClick={() => commentInputRef.current.focus()}><CommentIcon /></ActionButton>
                                {comments.length > 0 && <CounterBadge>{comments.length}</CounterBadge>}
                            </ActionButtonContainer>
                            <ActionButtonContainer style={{ marginLeft: 'auto' }}>
                                <ActionButton onClick={handleSave}>{isSavedByMe ? <SavedIcon /> : <SaveIcon />}</ActionButton>
                            </ActionButtonContainer>
                        </ActionsWrapper>
                        <div style={{ padding: '0 16px', fontSize: '0.8rem', color: '#8e8e8e', margin: '8px 0' }}>{formatTimestamp(post.createdAt)}</div>
                        <CommentForm onSubmit={handleCommentSubmit}>
                            <input ref={commentInputRef} type="text" placeholder="Adiciona um comentário..." value={newComment} onChange={(e) => setNewComment(e.target.value)} />
                            <button type="submit">Publicar</button>
                        </CommentForm>
                    </DetailsContainer>
                 </PostAndCommentsWrapper>
            </DesktopPageContainer>
        )
    }

    return <DesktopView onCommentAdded={handleDesktopCommentAdded} />; // Passa a função para o DesktopView
};

export default SinglePostPage;