import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from './firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

function syncArrayToFirestore(collectionName: string, oldArr: any[], newArr: any[]) {
  // Guard and filter out items without a valid ID
  const validOld = (oldArr || []).filter(i => i && typeof i.id === 'string' && i.id.trim() !== '' && i.id !== 'undefined' && i.id !== 'null');
  const validNew = (newArr || []).filter(i => i && typeof i.id === 'string' && i.id.trim() !== '' && i.id !== 'undefined' && i.id !== 'null');

  const oldMap = new Map(validOld.map((item: any) => [item.id, item]));
  const newMap = new Map(validNew.map((item: any) => [item.id, item]));

  newMap.forEach((newItem, id) => {
    if (!id || typeof id !== 'string' || id.trim() === '' || id === 'undefined' || id === 'null') return;
    const oldItem = oldMap.get(id);
    if (!oldItem) {
      setDoc(doc(db, collectionName, id), newItem).catch(e => handleFirestoreError(e, OperationType.WRITE, collectionName));
    } else if (JSON.stringify(oldItem) !== JSON.stringify(newItem)) {
      setDoc(doc(db, collectionName, id), newItem).catch(e => handleFirestoreError(e, OperationType.WRITE, collectionName));
    }
  });

  oldMap.forEach((oldItem, id) => {
    if (!id || typeof id !== 'string' || id.trim() === '' || id === 'undefined' || id === 'null') return;
    if (!newMap.has(id)) {
      deleteDoc(doc(db, collectionName, id)).catch(e => handleFirestoreError(e, OperationType.DELETE, collectionName));
    }
  });
}

export function useFirebaseSync<T extends {id: string}>(collectionName: string, initialData: T[], enabled = true) {
   const [state, setState] = useState<T[]>(initialData);
   const [isLoaded, setIsLoaded] = useState(false);
   
   useEffect(() => {
     if (!enabled) {
       setIsLoaded(true);
       return;
     }
     const unsub = onSnapshot(collection(db, collectionName), (snapshot) => {
       const docs = snapshot.docs.map(doc => doc.data() as T);
       if (!isLoaded && docs.length > 0) {
          setState(docs);
       } else if (!isLoaded && docs.length === 0) {
          // initialize seed
          initialData.forEach(item => {
             if (item && item.id && typeof item.id === 'string' && item.id.trim() !== '' && item.id !== 'undefined' && item.id !== 'null') {
               setDoc(doc(db, collectionName, item.id), item).catch(() => {});
             }
          });
          setState(initialData);
       }
       setIsLoaded(true);
     }, (err) => {
       if (err.code === 'permission-denied') {
         console.warn(`Firestore read permission denied for collection '${collectionName}'. Gracefully falling back to local.`);
       } else {
         console.error("Firebase Sync Error", err);
       }
       setIsLoaded(true); // fall back to local
     });
     return () => unsub();
   }, [collectionName, initialData, isLoaded, enabled]);

   const customSetState = (valOrFunc: React.SetStateAction<T[]>) => {
      setState((prev: T[]) => {
         const newArr = typeof valOrFunc === 'function' ? (valOrFunc as any)(prev) : valOrFunc;
         syncArrayToFirestore(collectionName, prev, newArr);
         return newArr;
      });
   };

   return [state, customSetState, isLoaded] as const;
}

export function useFirebaseSyncConfig<T>(collectionName: string, initialData: T) {
  const [state, setState] = useState<T>(initialData);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
     const unsub = onSnapshot(doc(db, collectionName, 'main'), (snap) => {
        if (snap.exists()) {
           setState(snap.data() as T);
           setIsLoaded(true);
        } else {
           setDoc(doc(db, collectionName, 'main'), initialData).catch(() => {});
           setState(initialData);
           setIsLoaded(true);
        }
     }, (err) => {
        console.error("Firebase Sync Error", err);
        setIsLoaded(true);
     });
     return () => unsub();
  }, [collectionName, initialData]);

  const customSetState = (valOrFunc: React.SetStateAction<T>) => {
      setState((prev: T) => {
         const newVal = typeof valOrFunc === 'function' ? (valOrFunc as any)(prev) : valOrFunc;
         if (JSON.stringify(prev) !== JSON.stringify(newVal)) {
           setDoc(doc(db, collectionName, 'main'), newVal);
         }
         return newVal;
      });
  };

  return [state, customSetState, isLoaded] as const;
}
