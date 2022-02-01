const APP_CWD       = process.cwd();
const Item          = require(APP_CWD + '/models/itemSchema');

const ITEMS_PER_PAGE = 20;
exports.getItemsView = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;
  Item.find().countDocuments().then(itemsCount => {
      totalItems = itemsCount;
      return Item.find().skip((page - 1) * ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE);
    })
    .then(items => {
      res.render('store/itemsView', {
        items: items,
        pageTitle: 'Items',
        path: '/store/item-list',
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      console.log('getItemsView ERROR: ', error);
      return next(error);
    });
};

exports.getItemView = (req, res, next) => {
  const itemId = req.params.itemId;
  Item.findById(itemId)
    .then(item => {
      res.render('store/itemDetailView', {
        item: item,
        pageTitle: item.title,
        path: '/store/item-list'
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      console.log('getItemView ERROR: ', error);
      return next(error);
    });
};


