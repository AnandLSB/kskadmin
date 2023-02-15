import React from 'react'
import { auth } from '../firebase'
import { signOut } from 'firebase/auth'

const Dashboard = () => {
  return (
    <div >
        <div >
        Dashboard
        <p>{auth.currentUser.email}</p>
        <button onClick={() => signOut(auth)}>Sign Out</button>
        </div>
    </div>
  )
}

export default Dashboard