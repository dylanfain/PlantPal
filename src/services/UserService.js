import { db } from "../firebase";
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where 
} from "firebase/firestore";

export const UserService = {
  // Follow a user
  followUser: async (currentUserId, userToFollowId) => {
    const followRef = doc(db, "follows", `${currentUserId}_${userToFollowId}`);
    await setDoc(followRef, {
      follower: currentUserId,
      following: userToFollowId,
      timestamp: new Date()
    });
  },

  // Unfollow a user
  unfollowUser: async (currentUserId, userToUnfollowId) => {
    const followRef = doc(db, "follows", `${currentUserId}_${userToUnfollowId}`);
    await deleteDoc(followRef);
  },

  // Get following list
  getFollowing: async (userId) => {
    const followsRef = collection(db, "follows");
    const q = query(followsRef, where("follower", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data().following);
  },

  // Get followers list
  getFollowers: async (userId) => {
    const followsRef = collection(db, "follows");
    const q = query(followsRef, where("following", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data().follower);
  }
}; 