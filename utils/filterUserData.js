exports.filterUserData = (req, ...allowedFields) => {
  const newReq = {};

  Object.keys(req).forEach(key => {
    if (allowedFields.includes(key)) {
      newReq[key] = req[key];
    }
  });
  return newReq;
};
