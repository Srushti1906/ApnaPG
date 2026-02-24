import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';

// ==================== USER SERVICES ====================

export const userService = {
  // Get user by UID
  getUser: async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      return userDoc.exists() ? userDoc.data() : null;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (uid, updates) => {
    try {
      await updateDoc(doc(db, 'users', uid), {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },
};

// ==================== PG SERVICES ====================

export const pgService = {
  // Create new PG
  createPG: async (pgData, ownerId) => {
    try {
      const docRef = await addDoc(collection(db, 'pgs'), {
        ...pgData,
        ownerId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return { id: docRef.id, ...pgData };
    } catch (error) {
      console.error('Error creating PG:', error);
      throw error;
    }
  },

  // Get all PGs with real-time listener
  subscribeAllPGs: (callback) => {
    try {
      const q = query(collection(db, 'pgs'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const pgs = snapshot.docs.map((doc) => ({
          pgId: doc.id,
          ...doc.data(),
        }));
        callback(pgs);
      });
      return unsubscribe;
    } catch (error) {
      console.error('Error subscribing to PGs:', error);
      throw error;
    }
  },

  // Get PG by ID
  getPG: async (pgId) => {
    try {
      const pgDoc = await getDoc(doc(db, 'pgs', pgId));
      return pgDoc.exists() ? { pgId: pgDoc.id, ...pgDoc.data() } : null;
    } catch (error) {
      console.error('Error fetching PG:', error);
      throw error;
    }
  },

  // Get owner's PGs
  getOwnerPGs: async (ownerId) => {
    try {
      const q = query(
        collection(db, 'pgs'),
        where('ownerId', '==', ownerId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        pgId: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error fetching owner PGs:', error);
      throw error;
    }
  },

  // Update PG
  updatePG: async (pgId, updates) => {
    try {
      await updateDoc(doc(db, 'pgs', pgId), {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating PG:', error);
      throw error;
    }
  },

  // Delete PG
  deletePG: async (pgId) => {
    try {
      await deleteDoc(doc(db, 'pgs', pgId));
      return { success: true };
    } catch (error) {
      console.error('Error deleting PG:', error);
      throw error;
    }
  },

  // Filter PGs by gender
  getPGsByGender: async (genderType) => {
    try {
      const q = query(
        collection(db, 'pgs'),
        where('genderAllowed', '==', genderType),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        pgId: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error filtering PGs by gender:', error);
      throw error;
    }
  },
};

// ==================== ROOM SERVICES ====================

export const roomService = {
  // Create room
  createRoom: async (roomData, pgId) => {
    try {
      const docRef = await addDoc(collection(db, 'rooms'), {
        ...roomData,
        pgId,
        createdAt: new Date().toISOString(),
      });
      return { id: docRef.id, ...roomData };
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  },

  // Get rooms for a PG with real-time listener
  subscribePGRooms: (pgId, callback) => {
    try {
      const q = query(
        collection(db, 'rooms'),
        where('pgId', '==', pgId),
        orderBy('createdAt', 'desc')
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const rooms = snapshot.docs.map((doc) => ({
          roomId: doc.id,
          ...doc.data(),
        }));
        callback(rooms);
      });
      return unsubscribe;
    } catch (error) {
      console.error('Error subscribing to rooms:', error);
      throw error;
    }
  },

  // Get room by ID
  getRoom: async (roomId) => {
    try {
      const roomDoc = await getDoc(doc(db, 'rooms', roomId));
      return roomDoc.exists() ? { roomId: roomDoc.id, ...roomDoc.data() } : null;
    } catch (error) {
      console.error('Error fetching room:', error);
      throw error;
    }
  },

  // Update room
  updateRoom: async (roomId, updates) => {
    try {
      await updateDoc(doc(db, 'rooms', roomId), updates);
      return { success: true };
    } catch (error) {
      console.error('Error updating room:', error);
      throw error;
    }
  },

  // Delete room
  deleteRoom: async (roomId) => {
    try {
      await deleteDoc(doc(db, 'rooms', roomId));
      return { success: true };
    } catch (error) {
      console.error('Error deleting room:', error);
      throw error;
    }
  },
};

// ==================== BOOKING SERVICES ====================

export const bookingService = {
  // Create booking
  createBooking: async (bookingData) => {
    try {
      const docRef = await addDoc(collection(db, 'bookings'), {
        ...bookingData,
        status: 'pending',
        createdAt: new Date().toISOString(),
      });
      return { id: docRef.id, ...bookingData };
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  },

  // Get user's bookings with real-time listener
  subscribeUserBookings: (userId, callback) => {
    try {
      const q = query(
        collection(db, 'bookings'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const bookings = snapshot.docs.map((doc) => ({
          bookingId: doc.id,
          ...doc.data(),
        }));
        callback(bookings);
      });
      return unsubscribe;
    } catch (error) {
      console.error('Error subscribing to user bookings:', error);
      throw error;
    }
  },

  // Get owner's bookings
  subscribeOwnerBookings: (ownerId, callback) => {
    try {
      const q = query(
        collection(db, 'bookings'),
        where('ownerId', '==', ownerId),
        orderBy('createdAt', 'desc')
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const bookings = snapshot.docs.map((doc) => ({
          bookingId: doc.id,
          ...doc.data(),
        }));
        callback(bookings);
      });
      return unsubscribe;
    } catch (error) {
      console.error('Error subscribing to owner bookings:', error);
      throw error;
    }
  },

  // Get booking by ID
  getBooking: async (bookingId) => {
    try {
      const bookingDoc = await getDoc(doc(db, 'bookings', bookingId));
      return bookingDoc.exists()
        ? { bookingId: bookingDoc.id, ...bookingDoc.data() }
        : null;
    } catch (error) {
      console.error('Error fetching booking:', error);
      throw error;
    }
  },

  // Update booking status
  updateBookingStatus: async (bookingId, status) => {
    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        status,
        updatedAt: new Date().toISOString(),
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw error;
    }
  },

  // Cancel booking
  cancelBooking: async (bookingId, reason) => {
    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        status: 'cancelled',
        cancellationReason: reason,
        cancelledAt: new Date().toISOString(),
      });
      return { success: true };
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw error;
    }
  },
};

// ==================== REVIEW SERVICES ====================

export const reviewService = {
  // Create review
  createReview: async (reviewData) => {
    try {
      const docRef = await addDoc(collection(db, 'reviews'), {
        ...reviewData,
        createdAt: new Date().toISOString(),
      });
      return { id: docRef.id, ...reviewData };
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  },

  // Get PG reviews with real-time listener
  subscribePGReviews: (pgId, callback) => {
    try {
      const q = query(
        collection(db, 'reviews'),
        where('pgId', '==', pgId),
        orderBy('createdAt', 'desc')
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const reviews = snapshot.docs.map((doc) => ({
          reviewId: doc.id,
          ...doc.data(),
        }));
        callback(reviews);
      });
      return unsubscribe;
    } catch (error) {
      console.error('Error subscribing to reviews:', error);
      throw error;
    }
  },

  // Get review by ID
  getReview: async (reviewId) => {
    try {
      const reviewDoc = await getDoc(doc(db, 'reviews', reviewId));
      return reviewDoc.exists()
        ? { reviewId: reviewDoc.id, ...reviewDoc.data() }
        : null;
    } catch (error) {
      console.error('Error fetching review:', error);
      throw error;
    }
  },

  // Update review
  updateReview: async (reviewId, updates) => {
    try {
      await updateDoc(doc(db, 'reviews', reviewId), {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating review:', error);
      throw error;
    }
  },

  // Delete review
  deleteReview: async (reviewId) => {
    try {
      await deleteDoc(doc(db, 'reviews', reviewId));
      return { success: true };
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  },
};
