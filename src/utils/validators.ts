export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };
  
  // Validate name (assuming name must only contain letters and spaces)
  export const validateName = (name: string): boolean => {
    const nameRegex = /^[A-Za-z\s]+$/; // Only letters and spaces allowed
    return nameRegex.test(name);
  };
  
  // Validate password (must be at least 8 characters long, contain a number and a special character)
  export const validatePassword = (password: string): boolean => {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };