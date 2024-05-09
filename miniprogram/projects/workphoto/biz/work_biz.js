/**
 * Notes: 服务者管理模块业务逻辑
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2022-01-14 07:48:00 
 */

const BaseBiz = require('../../../comm/biz/base_biz.js');
const cloudHelper = require('../../../helper/cloud_helper.js'); 
const cacheHelper = require('../../../helper/cache_helper.js');
const pageHelper = require('../../../helper/page_helper.js');
const constants = require('../../../comm/constants.js');
const setting = require('../../../setting/setting.js');

class WorkBiz extends BaseBiz {

	static async workLogin(that, phone, pwd) {
		if (phone.length != 11) {
			wx.showToast({
				title: '手机号输入错误',
				icon: 'none'
			});
			return;
		}

		if (pwd.length < 5 || pwd.length > 30) {
			wx.showToast({
				title: '密码输入错误(5-30位)',
				icon: 'none'
			});
			return;
		}

		let params = {
			phone,
			pwd
		};
		let opt = {
			title: '登录中'
		};

		try {
			await cloudHelper.callCloudSumbit('work/login', params, opt).then(res => {
				if (res && res.data)
					cacheHelper.set(constants.CACHE_WORK, res.data, constants.WORK_TOKEN_EXPIRE);

				wx.reLaunch({
					url: pageHelper.fmtURLByPID('/pages/work/index/home/work_home'),
				});
			});
		} catch (e) {
			console.log(e);
		}

	}


	/**
	 * 清空管理员登录
	 */
	static clearWorkToken() {
		cacheHelper.remove(constants.CACHE_WORK);
	}

	/**
	 * 获取管理员信息
	 */
	static getWorkToken() {
		return cacheHelper.get(constants.CACHE_WORK);
	}


	static getWorkName() {
		let work = cacheHelper.get(constants.CACHE_WORK);
		if (!work) return '';
		return work.name;
	} 

	static getWorkId() {
		let token = cacheHelper.get(constants.CACHE_WORK);
		if (!token) return '';
		return token._id || '';
  }

  static getWorkCateId() {
		let token = cacheHelper.get(constants.CACHE_WORK);
		if (!token) return '';
		return token.MEET_CATE_ID || '';
  }
  
  static getWorkPhone() {
		let token = cacheHelper.get(constants.CACHE_WORK);
		if (!token) return '';
		return token.MEET_PHONE || '';
	}


	//  登录状态判定
	static isWork() {

		let work = cacheHelper.get(constants.CACHE_WORK);
		if (!work) {
			return false
		}
		return true;
	}

	// 静默登录(有登录状态则不登录)  
	static async loginSilence(that) {
		return await WorkBiz.loginCheck(false, 'slience', '加载中...', that);
	}

	// 登录判断及处理
	static async loginCheck(mustLogin = false, method = 'back', title = '', that = null) {
		let opt = {
			title: title || '登录中',
		};

    let res = await cloudHelper.callCloudSumbit('work/login', { phone:WorkBiz.getWorkPhone() }, opt);
    if (res && res.data && res.data.MEET_TOKEN) {
      cacheHelper.set(constants.CACHE_WORK, res.data, constants.WORK_TOKEN_EXPIRE);
      return true;
    }else{
      cacheHelper.remove(constants.CACHE_WORK)
      return false;
    }
	}

}


WorkBiz.CHECK_FORM_MGR_PWD = {
	oldPassword: 'formOldPassword|must|string|min:6|max:30|name=旧密码',
	password: 'formPassword|must|string|min:6|max:30|name=新密码',
	password2: 'formPassword2|must|string|min:6|max:30|name=新密码再次填写',
};



module.exports = WorkBiz;