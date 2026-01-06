import { Timestamp } from 'firebase/firestore';

/**
 * Convert Firestore Timestamp or Date to Date object
 */
export const toDate = (timestamp: Timestamp | Date | undefined): Date => {
  if (!timestamp) return new Date();
  return timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
};
