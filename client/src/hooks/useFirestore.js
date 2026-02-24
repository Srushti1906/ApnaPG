import { useState, useEffect } from 'react';
import { pgService, roomService, bookingService, reviewService } from '../services/firestore';

// Hook to get all PGs with real-time updates
export function usePGs() {
  const [pgs, setPGs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = pgService.subscribeAllPGs((data) => {
      setPGs(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { pgs, loading, error };
}

// Hook to get rooms for a PG with real-time updates
export function usePGRooms(pgId) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!pgId) return;

    setLoading(true);
    const unsubscribe = roomService.subscribePGRooms(pgId, (data) => {
      setRooms(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [pgId]);

  return { rooms, loading, error };
}

// Hook to get reviews for a PG with real-time updates
export function usePGReviews(pgId) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!pgId) return;

    setLoading(true);
    const unsubscribe = reviewService.subscribePGReviews(pgId, (data) => {
      setReviews(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [pgId]);

  return { reviews, loading, error };
}

// Hook to get user's bookings with real-time updates
export function useUserBookings(userId) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;

    setLoading(true);
    const unsubscribe = bookingService.subscribeUserBookings(userId, (data) => {
      setBookings(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  return { bookings, loading, error };
}

// Hook to get owner's bookings with real-time updates
export function useOwnerBookings(ownerId) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!ownerId) return;

    setLoading(true);
    const unsubscribe = bookingService.subscribeOwnerBookings(ownerId, (data) => {
      setBookings(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [ownerId]);

  return { bookings, loading, error };
}
