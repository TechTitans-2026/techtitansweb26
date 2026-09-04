export const ALLOWED_ADMIN_NAMES = [
  'khushi',
  'shweta',
  'alen',
  'hemang',
  'immanuel',
  'amit',
  'armaan',
  'aryan',
  'mohammad',
];

/**
 * Checks if a given user/profile has admin/head role AND is one of the authorized admins.
 */
export const isAuthorizedAdmin = (profile, user) => {
  if (!profile && !user) return false;

  const role = profile?.role;
  const isRoleAdmin = role === 'admin' || role === 'head';

  const nameToCheck = (
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email ||
    ''
  ).toLowerCase();

  const isWhitelisted = ALLOWED_ADMIN_NAMES.some((name) =>
    nameToCheck.includes(name)
  );

  return isRoleAdmin && isWhitelisted;
};

/**
 * Checks if a user is one of the authorized admins regardless of current role in DB.
 */
export const canClaimAdminAccess = (profile, user) => {
  if (!profile && !user) return false;

  const nameToCheck = (
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email ||
    ''
  ).toLowerCase();

  return ALLOWED_ADMIN_NAMES.some((name) => nameToCheck.includes(name));
};
