/**
 * Notes: passport模块控制器
 * Date: 2021-03-15 19:20:00 
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 */

const BaseProjectController = require('./base_project_controller.js');
const PassportService = require('../service/passport_service.js');
const contentCheck = require('../../../framework/validate/content_check.js');

// 引入axios
const axios = require('axios')
// 用到md5
const crypto = require('crypto'); 

class PassportController extends BaseProjectController {

	/** 取得我的用户信息 */
	async getMyDetail() {
		let service = new PassportService();
		return await service.getMyDetail(this._userId);
	}

	/** 获取手机号码 */
	async getPhone() {

		// 数据校验
		let rules = {
			cloudID: 'must|string|min:1|max:200|name=cloudID',
		};

		// 取得数据
		let input = this.validateData(rules);


		let service = new PassportService();
		return await service.getPhone(input.cloudID);
	}


	/** 注册 */
	async register() {
		// 数据校验
		let rules = {
      // name: 'must|string|min:1|max:30|name=昵称',
      name: 'string|min:1|max:30|name=昵称',
			mobile: 'must|mobile|name=手机',
			forms: 'array|name=表单|default=[]',
			status: 'int|default=1'
		};

		// 取得数据
		let input = this.validateData(rules);

		// 内容审核
		await contentCheck.checkTextMultiClient(input);

    let service = new PassportService();
		return await service.register(this._userId, input);
	}

	/** 修改用户资料 */
	async editBase() {
		// 数据校验
		let rules = {
			name: 'must|string|min:1|max:30|name=昵称',
			mobile: 'must|mobile|name=手机',
			forms: 'array|name=表单',
		};

		// 取得数据
    let input = this.validateData(rules);
    
		// 内容审核
		await contentCheck.checkTextMultiClient(input);

		let service = new PassportService();
		return await service.editBase(this._userId, input);
	}

	/** 登录 */
	async login() {
		// 数据校验
		let rules = {};

		// 取得数据
		let input = this.validateData(rules);

		let service = new PassportService();
		return await service.login(this._userId);
  }
  
  /** 获取验证码 achang-8gptgjxj307299e8 */
  async gettestcode() {
    // let service = new PassportService();
    // let res = await service.getPhone(this._request.cloudID)
    // console.log("纳达斯噶",res);
    let base_url = 'https://app.cloopen.com:8883';
    let accountSid = '8aaf0708827c8fd50182a13dd03905b8';
    let accountToken = '7913f4678107496d9f3677c4a0853af3';
    let timestr = this.formatTimestamp();
    // 创建一个MD5 hash对象  
    const hash = crypto.createHash('md5');  
    // 更新hash对象的内容  
    hash.update(accountSid+accountToken+timestr);  
    // 获取16进制格式的MD5哈希值  
    let sig = hash.digest('hex').toUpperCase();
    let url = base_url+`/2013-12-26/Accounts/${accountSid}/SMS/TemplateSMS?sig=${sig}`;

    // 请求头
    // 将字符串转换为Buffer实例  
    const buffer = Buffer.from(accountSid+':'+timestr);  
    // 将Buffer实例转换为Base64编码的字符串  
    let Authorization = buffer.toString('base64');
    console.log("发送验证码",this._request);
    let result = await axios({
      url,
      method: 'POST', // 设置请求方法（GET、POST等）
      data: {
        to:this._request.phoneNumber,
        appId:'8aaf0708827c8fd50182a13dd15205bf',
        templateId:'1',
        datas:[1234,3]
      },
      headers: {
        'Authorization': Authorization
      }
    })
    console.log("发送验证码2",this.result);
    return {
      code:1234
    }
  }

  formatTimestamp() {  
    const date = new Date();  
    const year = date.getFullYear().toString().padStart(4, '0'); // 4位年份  
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // 2位月份（注意月份是从0开始的，所以要+1）  
    const day = date.getDate().toString().padStart(2, '0'); // 2位日期  
    const hours = date.getHours().toString().padStart(2, '0'); // 2位小时  
    const minutes = date.getMinutes().toString().padStart(2, '0'); // 2位分钟  
    const seconds = date.getSeconds().toString().padStart(2, '0'); // 2位秒  
    
    return `${year}${month}${day}${hours}${minutes}${seconds}`;  
  }
  /** 一键登录 */
  async oneclicklogin() {
    let service = new PassportService();
    let res = await service.getPhone(this._request.cloudID)
    this._request.mobile = res;

    return this.register();
  }
}

module.exports = PassportController;