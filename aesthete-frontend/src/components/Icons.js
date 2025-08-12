import React from 'react';

// Ícone de coração vazio (não curtido)
export const HeartIcon = () => (
  <svg aria-label="Curtir" fill="currentColor" role="img" viewBox="0 0 24 24">
    <path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-6.12 8.42a18.108 18.108 0 0 1-2.38 2.088 3.744 3.744 0 0 1-2.991 0 18.108 18.108 0 0 1-2.38-2.088c-3.468-3.461-6.12-5.348-6.12-8.42a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.118-1.763a4.21 4.21 0 0 1 3.675-1.941z"></path>
  </svg>
);

// Ícone de coração preenchido (curtido)
export const LikedIcon = () => (
  <svg aria-label="Descurtir" fill="#ed4956" role="img" viewBox="0 0 48 48">
    <path d="M34.6 3.9c-4.2 0-7.9 2.1-10.6 5.6-2.7-3.5-6.4-5.6-10.6-5.6C6 3.9 0 9.9 0 17.6 0 28.3 10.3 38.5 24 44.2 37.7 38.5 48 28.3 48 17.6c0-7.7-6-13.7-13.4-13.7z"></path>
  </svg>
);

// Ícone de balão de comentário
export const CommentIcon = () => (
    <svg aria-label="Comentar" fill="currentColor" role="img" viewBox="0 0 24 24">
        <path d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"></path>
    </svg>
);