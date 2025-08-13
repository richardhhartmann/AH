import React from "react";
import { BsHandThumbsUp } from "react-icons/bs";
import { BsHandThumbsUpFill } from "react-icons/bs";
import { IoChatbubbleOutline } from "react-icons/io5";

// Ícone de coração vazio (não curtido)
export const HeartIcon = () => (
  <BsHandThumbsUp  size={24} style={{ color: "rgb(254, 121, 13)" }} />
);

// Ícone de coração preenchido (curtido)
export const LikedIcon = () => (
  <BsHandThumbsUpFill   size={24} style={{ color: "rgb(254, 121, 13)", fill: "rgb(254, 121, 13)" }} />
);

// Ícone de comentário
export const CommentIcon = () => (
  <IoChatbubbleOutline  size={24} style={{ color: "rgb(254, 121, 13)" }} />
);
