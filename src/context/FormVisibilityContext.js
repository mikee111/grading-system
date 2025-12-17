import React, { createContext, useContext, useState } from 'react';

const FormVisibilityContext = createContext();

export const useFormVisibility = () => {
  return useContext(FormVisibilityContext);
};

export const FormVisibilityProvider = ({ children }) => {
  const [showSignup, setShowSignup] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const value = {
    showSignup,
    setShowSignup,
    showLogin,
    setShowLogin,
  };

  return (
    <FormVisibilityContext.Provider value={value}>
      {children}
    </FormVisibilityContext.Provider>
  );
};
