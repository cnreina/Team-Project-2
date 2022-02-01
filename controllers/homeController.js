exports.getHomeView = (req, res, next) => {
  res.render('home/homeView', {
    pageTitle: 'Home',
    path: '/',
    isAuthenticated: req.session.isLoggedIn
  });
};
