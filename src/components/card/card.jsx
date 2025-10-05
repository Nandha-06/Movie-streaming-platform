import React, { useEffect, useState, memo } from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "./card.css";
import { Link } from "react-router-dom";
import { formatRating } from "../../utils/api";

const Cards = memo(({ movie }) => {
   const [isLoading, setIsLoading] = useState(!movie);

   useEffect(() => {
       if (movie) {
           setIsLoading(false);
       } else {
           const timer = setTimeout(() => {
               setIsLoading(false);
           }, 800);
           return () => clearTimeout(timer);
       }
   }, [movie]);

   if (isLoading) {
       return (
           <div className="cards">
               <SkeletonTheme color="#202020" highlightColor="#444">
                   <Skeleton height={300} duration={2} />
               </SkeletonTheme>
           </div>
       );
   }

   if (!movie) {
       return null;
   }

   const isTV = movie.media_type === 'tv' || movie.name || ((!movie.release_date) && movie.first_air_date);

   return (
       <Link to={`${isTV ? '/tv' : '/movie'}/${movie.id}`} style={{ textDecoration: "none", color: "white" }}>
           <div className="cards">
               <img
                   className="cards__img"
                   src={`https://image.tmdb.org/t/p/original${movie.poster_path || ""}`}
                   alt={(movie.original_title || movie.name || "")}
                   loading="lazy"
               />
               <div className="cards__overlay">
                   <div className="card__title">{(movie.original_title || movie.name || "").slice(0, 30)}</div>
                   <div className="card__runtime">
                       {(movie.release_date || movie.first_air_date || "").slice(0, 10)}
                       <span className="card__rating">
                           {formatRating(movie.vote_average)}
                           <i className="fas fa-star" />
                       </span>
                   </div>
                   <div className="card__description">
                       {movie.overview ? movie.overview.slice(0, 118) + "..." : ""}
                   </div>
               </div>
           </div>
       </Link>
   );
});

export default Cards;
