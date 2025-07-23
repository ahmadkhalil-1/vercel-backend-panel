export const isAuthenticated = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized. Please log in.' });
    }
    next();
};

export const isAdminOnly = (req, res, next) => {
    const role = req.user?.role;
    if (role === 'superadmin') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Admins only.' });
    }
};

export const isAdminOrManager = (req, res, next) => {
    const role = req.user?.role;
    if ( role === 'manager' || role === 'superadmin') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Admins or Managers only.' });
    }
};

export const isSuperAdminOnly = (req, res, next) => {
    if (req.user?.role === 'superadmin') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Super Admin only.' });
    }
};
