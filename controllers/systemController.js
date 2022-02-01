const fileObject = require('fs');

exports.deleteFile = (filePath) => {
  fileObject.unlink(filePath, (err) => {
        if (err) {
          console.log('deleteFile ERROR: ', err);
        };
    });
};
