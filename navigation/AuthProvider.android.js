import React, {createContext, useState} from 'react';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-community/google-signin';
import { LoginManager, AccessToken, GraphRequest, GraphRequestManager } from 'react-native-fbsdk';

export const AuthContext = createContext();

export const AuthProvider = ({children}) => {
  const [user, setUser] = useState(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login: async (email, password) => {
          try {
            await auth().signInWithEmailAndPassword(email, password);
          } catch (e) {
            console.log(e);
          }
        },
        googleLogin: async () => {
          try {
            // Get the users ID token
            const { idToken } = await GoogleSignin.signIn();

            // Create a Google credential with the token
            const googleCredential = auth.GoogleAuthProvider.credential(idToken);

            // Sign-in the user with the credential
            await auth().signInWithCredential(googleCredential);
          } catch(error) {
            console.log({error});
          }
        },
        fbLogin: async () => {
          try {
            // Attempt login with permissions
            const result = await LoginManager.logInWithPermissions(['public_profile', 'email', 'user_link']);
            console.log(result)

            if (result.isCancelled) {
              throw 'User cancelled the login process';
            }

            // Once signed in, get the users AccesToken
            const data = await AccessToken.getCurrentAccessToken();
            alert(data.accessToken.toString())

            if (!data) {
              throw 'Something went wrong obtaining access token';
            }

            const responseInfoCallback = (error, result) => {
              if (error) {
                console.log(error)
                alert('Error fetching data: ' + error.toString());
              } else {
                console.log(result)
                alert('Success fetching data: ' + result.toString());
              }
            }

            const infoRequest = new GraphRequest(
              '/me',
              {
                accessToken: data.accessToken,
                parameters: {
                  fields: {
                    string: 'id, name, link, email'
                  }
                }
              },
              responseInfoCallback
            );

            //Start the graph request
            const graph = new GraphRequestManager().addRequest(infoRequest).start;
            console.log(graph);

            // Create a Firebase credential with the AccessToken
            const facebookCredential = auth.FacebookAuthProvider.credential(data.accessToken);

            // Sign-in the user with the credential
            await auth().signInWithCredential(facebookCredential);
          } catch(error) {
            console.log(error);
          }
        },
        register: async (email, password) => {
          try {
            await auth().createUserWithEmailAndPassword(email, password);
          } catch (e) {
            console.log(e);
          }
        },
        logout: async () => {
          try {
            await auth().signOut();
          } catch (e) {
            console.log(e);
          }
        },
      }}>
      {children}
    </AuthContext.Provider>
  );
};
