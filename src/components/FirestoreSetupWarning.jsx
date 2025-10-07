import { useState, useEffect } from 'react';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { db } from '../firebase/config';
import './FirestoreSetupWarning.css';

const FirestoreSetupWarning = () => {
  const [showWarning, setShowWarning] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkFirestore = async () => {
      try {
        // Try to query Firestore
        const testQuery = query(collection(db, 'users'), limit(1));
        await getDocs(testQuery);
        // If successful, Firestore is set up
        setShowWarning(false);
      } catch (error) {
        // If error contains "offline" or "unavailable", Firestore isn't set up
        if (error.message.includes('offline') || error.message.includes('unavailable')) {
          setShowWarning(true);
        }
      } finally {
        setChecking(false);
      }
    };

    checkFirestore();
  }, []);

  if (checking || !showWarning) {
    return null;
  }

  return (
    <div className="firestore-warning">
      <div className="firestore-warning-content">
        <div className="firestore-warning-icon">⚠️</div>
        <div className="firestore-warning-text">
          <h3>Firestore Database Not Set Up</h3>
          <p>
            To use authentication features, please create the Firestore database in Firebase Console.
          </p>
          <ol>
            <li>Go to <a href="https://console.firebase.google.com/project/binge-monkey/firestore" target="_blank" rel="noopener noreferrer">Firebase Console</a></li>
            <li>Click "Create database"</li>
            <li>Choose "Start in test mode"</li>
            <li>Click "Enable"</li>
          </ol>
          <p className="firestore-warning-note">
            See <code>FIX_OFFLINE_ERROR.md</code> for detailed instructions.
          </p>
        </div>
        <button onClick={() => setShowWarning(false)} className="firestore-warning-close">
          ×
        </button>
      </div>
    </div>
  );
};

export default FirestoreSetupWarning;
