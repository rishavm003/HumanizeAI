/**
 * adminGuard
 * Middleware to ensure that the authenticated user has the 'admin' role.
 * This must be used AFTER the authGuard middleware.
 */
export const adminGuard = async (req, res, next) => {
  try {
    // The authGuard already attaches the user profile to req.user
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Admin access required for this resource'
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};
