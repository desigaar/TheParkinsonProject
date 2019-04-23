import * as firebase from "firebase";
import { Platform, StatusBar } from "react-native";
import { Google } from "expo";

import ApiKeys from "../../constants/ApiKeys";

export const setCurrentUser = user => {
  return { type: "SET_CURRENT_USER", user };
};

export const logInWithCreds = credentials => {
  return dispatch => {
    // Log the user in with credentials
    firebase
      .auth()
      .signInWithEmailAndPassword(credentials.email, credentials.password)
      .then(() => {
        dispatch({ type: "LOGIN_SUCCESS" });
      })
      .catch(error => {
        dispatch({ type: "LOGIN_ERROR", error });
      });
  };
};

export const registerWithCreds = credentials => {
  return dispatch => {
    // Create a new user and log it in
    if (credentials.password !== credentials.passwordConfirm) {
      dispatch({ type: "LOGIN_ERROR", error: { message: "Wachtwoorden zijn niet hetzelfde!" } });
    } else {
      firebase
        .auth()
        .createUserWithEmailAndPassword(credentials.email, credentials.password)
        .then(() => {
          dispatch({ type: "LOGIN_SUCCESS" });
          // Send verification to user
          firebase.auth().currentUser.sendEmailVerification();
        })
        .catch(error => {
          dispatch({ type: "LOGIN_ERROR", error });
        });
    }
  };
};

export const logInWithGoogle = () => {
  // Google login only works within the Expo client app - standalone apps won't work
  return dispatch => {
    // Set StatusBar on iOS to match the white background and reset it
    Platform.OS === "ios" && StatusBar.setBarStyle({ style: "dark-content", animated: true });
    Google.logInAsync({
      clientId: Platform.OS === "ios" ? ApiKeys.GoogleLogin.iOS.clientId : ApiKeys.GoogleLogin.android.clientId
    })
      .then(loginResult => {
        var credential = firebase.auth.GoogleAuthProvider.credential(loginResult.idToken);
        // Sign in with credential from the Google user.
        firebase
          .auth()
          .signInAndRetrieveDataWithCredential(credential)
          .then(() => {
            dispatch({ type: "LOGIN_SUCCESS" });
            Platform.OS === "ios" && StatusBar.setBarStyle({ style: "light-content", animated: true });
          })
          .catch(error => {
            dispatch({ type: "LOGIN_ERROR", error });
            Platform.OS === "ios" && StatusBar.setBarStyle({ style: "light-content", animated: true });
          });
      })
      .catch(error => {
        dispatch({ type: "LOGIN_ERROR", error: { message: "Mislukt om met Google te verifiëren" } });
        Platform.OS === "ios" && StatusBar.setBarStyle({ style: "light-content", animated: true });
      });
  };
};

export const logInAsAnon = () => {
  return dispatch => {
    firebase
      .auth()
      .signInAnonymously()
      .then(() => {
        dispatch({ type: "LOGIN_SUCCESS" });
      })
      .catch(error => {
        dispatch({ type: "LOGIN_ERROR", error });
      });
  };
};

export const sendPasswordResetEmail = email => {
  // Send password reset to email
  return dispatch => {
    firebase
      .auth()
      .sendPasswordResetEmail(email)
      .then(
        () => {
          // Send password reset email was successful
          dispatch({ type: "PASSWORDRESET_SUCCESS" });
        },
        error => {
          // Returned an error and is displaying it to the user
          dispatch({ type: "PASSWORDRESET_ERROR", error });
        }
      );
  };
};

export const logOut = () => {
  // Logs out the current user
  return dispatch => {
    firebase
      .auth()
      .signOut()
      .then(() => {
        dispatch({ type: "LOGOUT_SUCCESS" });
      })
      .catch(error => {
        dispatch({ type: "LOGOUT_ERROR", error });
      });
  };
};

export const clearError = () => {
  return { type: "AUTH_CLEAR" };
};

export const setAuthLoading = () => {
  return { type: "AUTH_LOADING" };
};
