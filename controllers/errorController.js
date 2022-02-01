const { Error } = require("mongoose");

exports.get404View = (req, res, next) => {
  res.status(404).render('error/404View', {
    pageTitle: 'Resource Not Found',
    path: '/404',
    isAuthenticated: req.session.isLoggedIn
  });
};
