const getTimeCount = btn => {
  const taskId      = btn.parentNode.querySelector('[name=taskId]').value;
  const csrf        = btn.parentNode.querySelector('[name=_csrf]').value;

  fetch('/user/timecount/' + taskId, {
    method: 'POST',
    headers: {
      'csrf-token': csrf
    }
  })
    .then(result => {
      return result.json();
    })
    .then(data => {
      console.log('getTimeCount data: ', data);
    })
    .catch(err => {
      console.log('getTimeCount ERROR: ', err);
    });
};
