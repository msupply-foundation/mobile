/**
 * mSupply Mobile
 * Sustainable Solutions (NZ) Ltd. 2020
 */

export const selectCurrentUser = ({ user }) => {
  const { currentUser } = user;
  return currentUser;
};

export const selectCurrentUserIsAdmin = ({ user }) => {
  const { currentUser } = user;
  const { isAdmin = false } = currentUser ?? {};
  return isAdmin;
};

export const selectCurrentUserPasswordHash = ({ user }) => {
  const { currentUser } = user;
  const { passwordHash = '' } = currentUser ?? {};
  return passwordHash;
};
