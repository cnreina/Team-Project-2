const deleteItem = btn => {
  const itemId      = btn.parentNode.querySelector('[name=itemId]').value;
  const csrf        = btn.parentNode.querySelector('[name=_csrf]').value;
  const itemElement = btn.closest('article');

  fetch('/user/delete-item/' + itemId, {
    method: 'DELETE',
    headers: {
      'csrf-token': csrf
    }
  })
    .then(result => {
      return result.json();
    })
    .then(data => {
      itemElement.parentNode.removeChild(itemElement);
    })
    .catch(err => {
      console.log('deleteItem ERROR: ', err);
    });
};
