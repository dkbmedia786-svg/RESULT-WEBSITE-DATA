import React, { useState, useEffect, useRef } from 'react';
import { db, handleFirestoreError, OperationType } from './firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

function syncArrayToFirestore(collectionName: string, oldArr: any[], newArr: any[]) {
  const validOld = (oldArr || []).filter(i => i && typeof i.id === 'string' && i.id.trim() !== '' && i.id !== 'undefined' && i.id !== 'null');
  const validNew = (newArr || []).filter(i => i && typeof i.id === 'string' && i.id.trim() !== '' && i.id !== 'undefined' && i.id !== 'null');

  const oldMap = new Map(validOld.map((item: any) => [item.id, item]));
  const newMap = new Map(validNew.map((item: any) => [item.id, item]));

  newMap.forEach((newItem, id) => {
    if (!id || typeof id !== 'string' || id.trim() === '' || id === 'undefined' || id === 'null') return;
    const oldItem = oldMap.get(id);
    if (!oldItem || JSON.stringify(oldItem) !== JSON.stringify(newItem)) {
      setDoc(doc(db, collectionName, id), newItem).catch(e => {
        alert(`Database Save Error (${collectionName}): ` + e.message);
        handleFirestoreError(e, OperationType.WRITE, collectionName);
      });
    }
  });

  oldMap.forEach((oldItem, id) => {
    if (!id || typeof id !== 'string' || id.trim() === '' || id === 'undefined' || id === 'null') return;
    if (!newMap.has(id)) {
      deleteDoc(doc(db, collectionName, id)).catch(e => {
        alert(`Database Delete Error (${collectionName}): ` + e.message);
        handleFirestoreError(e, OperationType.DELETE, collectionName);
      });
    }
  });
}

export function useFirebaseSync<T extends {id: string}>(collectionName: string, initialData: T[], enabled = true) {
   const [state, setState] = useState<T[]>(initialData);
   const [isLoaded, setIsLoaded] = useState(false);

   // Ref to prevent initialData from causing re-renders
   const initialDataRef = useRef(initialData);

   useEffect(() => {
     if (!enabled) {
       setIsLoaded(true);
       return;
     }
     setIsLoaded(false);
     
     const unsub = onSnapshot(collection(db, collectionName), (snapshot) => {
       const docs = snapshot.docs.map(doc => doc.data() as T);
       if (docs.length > 0) {
          setState(docs);
       } else {
          // initialize seed
          initialDataRef.current.forEach(item => {
             if (item && item.id && typeof item.id === 'string' && item.id.trim() !== '' && item.id !== 'undefined' && item.id !== 'null') {
               setDoc(doc(db, collectionName, item.id), item).catch(() => {});
             }
          });
          setState(initialDataRef.current);
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
   }, [collectionName, enabled]);

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
  const initialDataRef = useRef(initialData);

  useEffect(() => {
     setIsLoaded(false);
     const unsub = onSnapshot(doc(db, collectionName, 'main'), (snap) => {
        if (snap.exists()) {
           setState(snap.data() as T);
        } else {
           setDoc(doc(db, collectionName, 'main'), initialDataRef.current).catch(() => {});
           setState(initialDataRef.current);
        }
        setIsLoaded(true);
     }, (err) => {
        console.error("Firebase Sync Error", err);
        setIsLoaded(true);
     });
     return () => unsub();
  }, [collectionName]);

  const customSetState = (valOrFunc: React.SetStateAction<T>) => {
      setState((prev: T) => {
         const newVal = typeof valOrFunc === 'function' ? (valOrFunc as any)(prev) : valOrFunc;
         if (JSON.stringify(prev) !== JSON.stringify(newVal)) {
           setDoc(doc(db, collectionName, 'main'), newVal).catch(e => {
             console.error("Failed to sync config:", e);
             alert(`Database Config Save Error! File might be too large: ` + e.message);
           });
         }
         return newVal;
      });
  };

  return [state, customSetState, isLoaded] as const;
}
