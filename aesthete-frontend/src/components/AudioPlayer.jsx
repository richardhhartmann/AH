import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { FaPlay, FaPause } from 'react-icons/fa';

const PlayerWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const PlayButton = styled.button`
  background-color: rgb(254, 121, 13);
  border: none;
  border-radius: 50%;
  color: white;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const DurationText = styled.span`
  font-size: 0.85rem;
  color: ${props => props.isMe ? 'white' : '#555'};
`;

const AudioPlayer = ({ src, duration, isMe }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };
  
  // Formata a duração de segundos para M:SS
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <PlayerWrapper>
      <audio ref={audioRef} src={src} onEnded={() => setIsPlaying(false)} />
      <PlayButton onClick={togglePlayPause}>
        {isPlaying ? <FaPause size={14} /> : <FaPlay size={14} />}
      </PlayButton>
      <DurationText isMe={isMe}>{formatTime(duration)}</DurationText>
    </PlayerWrapper>
  );
};

export default AudioPlayer;