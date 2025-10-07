import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export const addToLiked = async (userId, movieId) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    likedMovies: arrayUnion(movieId)
  });
};

export const removeFromLiked = async (userId, movieId) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    likedMovies: arrayRemove(movieId)
  });
};

export const addToWatchLater = async (userId, movieId) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    watchLater: arrayUnion(movieId)
  });
};

export const removeFromWatchLater = async (userId, movieId) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    watchLater: arrayRemove(movieId)
  });
};

export const addToWatched = async (userId, movieId) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    watchedMovies: arrayUnion(movieId)
  });
};

export const getUserData = async (userId) => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? userSnap.data() : null;
};
