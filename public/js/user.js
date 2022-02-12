const deleteTask = btn => {
  const taskId      = btn.parentNode.querySelector('[name=taskId]').value;
  const csrf        = btn.parentNode.querySelector('[name=_csrf]').value;
  const taskElement = btn.closest('ul');

  fetch('/user/delete-task/' + taskId, {
    method: 'DELETE',
    headers: {
      'csrf-token': csrf
    }
  })
    .then(result => {
      return result.json();
    })
    .then(data => {
      taskElement.parentNode.removeChild(taskElement);
    })
    .catch(err => {
      console.log('deleteTask ERROR: ', err);
    });
};

const archiveTask = btn => {
  const taskId      = btn.parentNode.querySelector('[name=taskId]').value;
  const csrf        = btn.parentNode.querySelector('[name=_csrf]').value;
  const taskElement = btn.closest('ul');

  fetch('/user/archive-task/' + taskId, {
    method: 'POST',
    headers: {
      'csrf-token': csrf
    }
  })
    .then(result => {
      return result.json();
    })
    .then(data => {
      taskElement.parentNode.removeChild(taskElement);
    })
    .catch(err => {
      console.log('archiveTask ERROR: ', err);
    });
};

const startTask = btn => {
  // const taskId      = btn.parentNode.querySelector('[name=taskId]').value;
  // const csrf        = btn.parentNode.querySelector('[name=_csrf]').value;
  // const taskElement = btn.closest('ul');

  // fetch('/user/punchin/' + taskId, {
  //   method: 'POST',
  //   headers: {
  //     'csrf-token': csrf
  //   }
  // })
  //   .then(result => {
  //     return result.json();
  //   })
  //   .then(data => {
  //     taskElement.parentNode.removeChild(taskElement);
  //   })
  //   .catch(err => {
  //     console.log('punchIn ERROR: ', err);
  //   });
};

const stopTask = btn => {
  // const taskId      = btn.parentNode.querySelector('[name=taskId]').value;
  // const csrf        = btn.parentNode.querySelector('[name=_csrf]').value;
  // const taskElement = btn.closest('article');

  // fetch('/user/punchout/' + taskId, {
  //   method: 'POST',
  //   headers: {
  //     'csrf-token': csrf
  //   }
  // })
  //   .then(result => {
  //     return result.json();
  //   })
  //   .then(data => {
  //     taskElement.parentNode.removeChild(taskElement);
  //   })
  //   .catch(err => {
  //     console.log('punchOut ERROR: ', err);
  //   });
};
