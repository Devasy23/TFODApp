import React, { useState } from 'react';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';


const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async event => {
    event.preventDefault();
    try {
        async function onGoogleButtonPress() {
            // Check if your device supports Google Play
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
            // Get the users ID token
            const { idToken } = await GoogleSignin.signIn();
          
            // Create a Google credential with the token
            const googleCredential = auth.GoogleAuthProvider.credential(idToken);
          
            // Sign-in the user with the credential
            return auth().signInWithCredential(googleCredential);
        }
         
      onLoginSuccess(username);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="username">Username:</label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={event => setUsername(event.target.value)}
        />
      </div>
      <div>
        <label htmlFor="password">Password:</label>
        <input 
            type="password"
            id="password"
            value={password}
            onChange={event => setPassword(event.target.value)}
        />
        </div>
        <button type="submit">Login</button>
        {error && <p>{error}</p>}
    </form>
    );
};
 
export default Login;
