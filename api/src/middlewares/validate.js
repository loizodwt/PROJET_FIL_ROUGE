// Manual validation middleware (no express-validator dependency)
function validate(rules) {
  return (req, res, next) => {
    const errors = [];
    for (const rule of rules) {
      const error = rule(req);
      if (error) errors.push(error);
    }
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }
    next();
  };
}

// Rule helpers
const body = (field) => ({
  notEmpty: (msg) => (req) => {
    if (!req.body[field] || String(req.body[field]).trim() === '') return msg || `${field} est requis`;
    return null;
  },
  isEmail: (msg) => (req) => {
    const v = req.body[field];
    if (!v || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return msg || `${field} doit être un email valide`;
    return null;
  },
  minLength: (n, msg) => (req) => {
    const v = req.body[field];
    if (!v || String(v).length < n) return msg || `${field} doit contenir au moins ${n} caractères`;
    return null;
  },
  isInt: (opts, msg) => (req) => {
    const v = req.body[field];
    if (v === undefined || v === '') return null; // optional
    const n = parseInt(v);
    if (isNaN(n)) return msg || `${field} doit être un nombre entier`;
    if (opts?.min !== undefined && n < opts.min) return msg || `${field} doit être >= ${opts.min}`;
    if (opts?.max !== undefined && n > opts.max) return msg || `${field} doit être <= ${opts.max}`;
    return null;
  },
});

module.exports = { validate, body };
