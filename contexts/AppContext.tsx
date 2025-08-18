import React, { createContext, useState, useCallback, useContext, ReactNode, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, query, where, orderBy, Query, writeBatch } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { ServiceRequest, Conversation, RequestStatus, Invoice, Rating } from '@/shared/types';
import { useAuth } from './AuthContext';

interface AppContextState {
  requests: ServiceRequest[];
  conversations: Conversation[];
  handleNewRequest: (newRequestData: Omit<ServiceRequest, 'id' | 'status' | 'paymentStatus' | 'assignedTechnicianUid'>) => void;
  handleUpdateStatus: (id: string, status: RequestStatus) => void;
  handleCreateInvoice: (requestId: string, invoice: Omit<Invoice, 'issuedDate'>) => void;
  handleMarkAsPaid: (requestId: string) => void;
  handleAddRating: (requestId: string, ratingBy: 'customer' | 'technician', rating: Rating) => void;
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
}

const AppContext = createContext<AppContextState | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { userProfile } = useAuth();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    if (!userProfile) {
      setRequests([]);
      return;
    }

    let requestsQuery: Query;
    const requestsCollection = collection(db, 'requests');

    if (userProfile.role === 'customer') {
      requestsQuery = query(requestsCollection, where("customerId", "==", userProfile.uid), orderBy('dateTime', 'desc'));
    } else {
      // Note: The technician query can also be updated for consistency, 
      // though it might work without an index since it's a simple sort.
      // It's best practice to make them consistent.
      requestsQuery = query(requestsCollection, orderBy('dateTime', 'desc'));
    }

    const unsubscribe = onSnapshot(requestsQuery, (querySnapshot) => {
      const requestsData: ServiceRequest[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ServiceRequest));
      setRequests(requestsData);
    }, (error) => {
      console.error("Error in requests snapshot listener (AppContext.tsx):", error);
    });

    return () => unsubscribe();
  }, [userProfile]);

  useEffect(() => {
    if (!userProfile) {
      setConversations([]);
      return;
    }

    const conversationsQuery = query(
      collection(db, 'conversations'),
      where("participantUids", "array-contains", userProfile.uid),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(conversationsQuery, (querySnapshot) => {
      const conversationsData: Conversation[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<Conversation, 'id'>)
      }));
      setConversations(conversationsData);
    }, (error) => {
      console.error("Error in conversations snapshot listener (AppContext.tsx):", error);
    });
    return () => unsubscribe();
  }, [userProfile]);


  const handleNewRequest = useCallback(async (newRequestData: Omit<ServiceRequest, 'id' | 'status' | 'paymentStatus' | 'assignedTechnicianUid'>) => {
    try {
      await addDoc(collection(db, 'requests'), {
        ...newRequestData,
        status: RequestStatus.PENDING,
        paymentStatus: 'none',
        assignedTechnicianUid: null,
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      console.error("Error adding document in AppContext.tsx: ", e);
    }
  }, []);

  const handleUpdateStatus = useCallback(async (id: string, status: RequestStatus) => {
    if (!userProfile) {
      console.error("Cannot update status, no user is logged in.");
      return;
    }

    const requestDocRef = doc(db, 'requests', id);
    const updatedRequest = requests.find(r => r.id === id);

    if (!updatedRequest) {
      console.error("Could not find the request to update.");
      return;
    }

    try {
      const batch = writeBatch(db);

      const updateData: { status: RequestStatus, assignedTechnicianUid?: string } = { status };
      if (status === RequestStatus.ACCEPTED) {
        updateData.assignedTechnicianUid = userProfile.uid;
      }

      batch.update(requestDocRef, updateData);

      if (status === RequestStatus.ACCEPTED) {
        const conversationRef = doc(collection(db, 'conversations'));

        batch.set(conversationRef, {
          participantUids: [updatedRequest.customerId, userProfile.uid], // <-- UPDATED
          participantInfo: {
            [updatedRequest.customerId]: { // <-- UPDATED
              fullName: updatedRequest.customerName,
              avatarUrl: updatedRequest.customerAvatar,
            },
            [userProfile.uid]: {
              fullName: userProfile.fullName,
              avatarUrl: userProfile.avatarUrl,
            }
          },
          lastMessageText: 'Service request accepted. Feel free to ask any questions.',
          updatedAt: serverTimestamp(),
        });

        const messageRef = doc(collection(conversationRef, 'messages'));
        batch.set(messageRef, {
          senderUid: userProfile.uid,
          text: 'Service request accepted. Feel free to ask any questions.',
          timestamp: serverTimestamp(),
        });
      }

      await batch.commit();

    } catch (e) {
      console.error("Error updating status or creating conversation: ", e);
    }
  }, [requests, userProfile]);

  const handleCreateInvoice = useCallback(async (requestId: string, invoiceData: Omit<Invoice, 'issuedDate'>) => {
    const requestDocRef = doc(db, 'requests', requestId);
    try {
      await updateDoc(requestDocRef, {
        invoice: { ...invoiceData, issuedDate: new Date().toISOString() },
        paymentStatus: 'pending'
      });
    } catch (e) {
      console.error("Error creating invoice: ", e);
    }
  }, []);

  const handleMarkAsPaid = useCallback(async (requestId: string) => {
    const requestDocRef = doc(db, 'requests', requestId);
    try {
      await updateDoc(requestDocRef, { paymentStatus: 'paid' });
    } catch (e) {
      console.error("Error marking as paid: ", e);
    }
  }, []);

  const handleAddRating = useCallback(async (requestId: string, ratingBy: 'customer' | 'technician', rating: Rating) => {
    const requestDocRef = doc(db, 'requests', requestId);
    const ratingField = ratingBy === 'customer' ? 'customerRating' : 'technicianRating';
    try {
      await updateDoc(requestDocRef, {
        [ratingField]: rating
      });
    } catch (e) {
      console.error("Error adding rating: ", e);
    }
  }, []);

  const value = {
    requests,
    conversations,
    handleNewRequest,
    handleUpdateStatus,
    handleCreateInvoice,
    handleMarkAsPaid,
    handleAddRating,
    setConversations,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};