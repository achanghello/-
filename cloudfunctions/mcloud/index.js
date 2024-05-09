const application = require('./framework/core/application.js');

// 云函数入口函数 
exports.main = async (event, context) => {
  console.log("您好",event);
	return await application.app(event, context);
}