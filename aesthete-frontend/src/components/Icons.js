import React from "react";
import { BsHandThumbsUp, BsHandThumbsUpFill, BsBookmark, BsBookmarkFill } from "react-icons/bs";
import { IoChatbubbleOutline } from "react-icons/io5";

// Ícone de coração vazio (não curtido)
export const HeartIcon = () => (
  <BsHandThumbsUp  size={24} style={{ color: "rgb(254, 121, 13)" }} />
);

// Ícone de coração preenchido (curtido)
export const LikedIcon = () => (
  <BsHandThumbsUpFill   size={24} style={{ color: "rgb(254, 121, 13)", fill: "rgb(254, 121, 13)" }} />
);

export const LikedIconPreview = () => (
  <BsHandThumbsUpFill   size={24} style={{ color: "rgba(255, 255, 255, 1)", fill: "rgba(255, 255, 255, 1)" }} />
);

// Ícone de comentário
export const CommentIcon = () => (
  <IoChatbubbleOutline  size={24} style={{ color: "rgb(254, 121, 13)" }} />
);

// Ícone de salvar (não salvo)
export const SaveIcon = () => (
    <BsBookmark size={24} style={{ color: "rgb(254, 121, 13)" }} />
);

// Ícone de salvo (preenchido)
export const SavedIcon = () => (
    <BsBookmarkFill size={24} style={{ color: "rgb(254, 121, 13)" }} />
);