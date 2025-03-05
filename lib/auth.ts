import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { db, signUp as firebaseSignUp, signIn as firebaseSignIn, signOut as firebaseSignOut } from "./firebase"

// Create a new user account
export async function createAccount(email: string, password: string, name: string) {
  try {
    // Create the user in Firebase Auth
    const user = await firebaseSignUp(email, password, name)

    // Create user document in Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email,
      displayName: name,
      photoURL: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      safetyScore: 100, // Initial perfect safety score
      warningCount: 0,
      suspensionCount: 0,
      isSuspended: false,
      suspensionEndDate: null,
      isTerminated: false,
      lastActive: serverTimestamp(),
    })

    return user
  } catch (error) {
    console.error("Error creating account:", error)
    throw error
  }
}

// Sign in a user
export async function signIn(email: string, password: string) {
  try {
    const user = await firebaseSignIn(email, password)

    // Update last active timestamp
    await updateDoc(doc(db, "users", user.uid), {
      lastActive: serverTimestamp(),
    })

    return user
  } catch (error) {
    console.error("Error signing in:", error)
    throw error
  }
}

// Sign out the current user
export async function signOut() {
  try {
    await firebaseSignOut()
  } catch (error) {
    console.error("Error signing out:", error)
    throw error
  }
}

// Get user data from Firestore
export async function getUserData(userId: string) {
  try {
    const userDoc = await getDoc(doc(db, "users", userId))
    if (userDoc.exists()) {
      return userDoc.data()
    }
    return null
  } catch (error) {
    console.error("Error getting user data:", error)
    throw error
  }
}

// Update user profile
export async function updateUserProfile(userId: string, data: Partial<UserProfile>) {
  try {
    await updateDoc(doc(db, "users", userId), {
      ...data,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error updating user profile:", error)
    throw error
  }
}

// User profile type
export type UserProfile = {
  uid: string
  email: string
  displayName: string
  photoURL: string | null
  createdAt: any
  updatedAt: any
  safetyScore: number
  warningCount: number
  suspensionCount: number
  isSuspended: boolean
  suspensionEndDate: any
  isTerminated: boolean
  lastActive: any
}

