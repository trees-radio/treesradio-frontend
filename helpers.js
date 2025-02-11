function getWebpackDefine(environment) {
  return {
    "process.env.NODE_ENV": JSON.stringify(environment)
  };
}

module.exports = {
  getWebpackDefine
};