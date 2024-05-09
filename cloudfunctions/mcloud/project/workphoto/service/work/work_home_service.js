/**
 * Notes: 服务者首页管理模块 
 * Date: 2023-01-15 07:48:00 
 * Ver : CCMiniCloud Framework 2.0.8 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 */

const BaseProjectWorkService = require('./base_project_work_service.js');

const timeUtil = require('../../../../framework/utils/time_util.js');
const dataUtil = require('../../../../framework/utils/data_util.js');
const md5Lib = require('../../../../framework/lib/md5_lib.js');

const MeetModel = require('../../model/meet_model.js');

const MeetService = require('../../service/meet_service.js');

class WorkHomeService extends BaseProjectWorkService {


	/**
	 * 首页数据归集
	 */
	async workHome(meetId) {

		let meetService = new MeetService();
		let dayList = await meetService.getDaysSet(meetId, timeUtil.time('Y-M-D'));
		let dayCnt = dayList.length;

		return { dayCnt };
  }
  
  async workLoginById(id) {
    let where = {
      _id: id,
    };
		let meet = await MeetModel.getOne(where);
    
    console.log("飙升",meet);
		if (!meet){
      this.AppError('登录错误请联系客服');
    }

		let cnt = meet.MEET_LOGIN_CNT;

		// 生成token
		let token = dataUtil.genRandomString(32);
		let tokenTime = timeUtil.time();
		let data = {
			MEET_TOKEN: token,
			MEET_TOKEN_TIME: tokenTime,
			MEET_LOGIN_TIME: timeUtil.time(),
			MEET_LOGIN_CNT: cnt + 1
		}
    await MeetModel.edit(where, data);
    
    meet.MEET_LOGIN_TIME = (!meet.MEET_LOGIN_TIME) ? '尚未登录' : timeUtil.timestamp2Time(meet.MEET_LOGIN_TIME);
    
    meet.MEET_ADD_IP = undefined;
    meet.MEET_ADD_TIME = undefined;
    meet.MEET_DAYS = undefined;
    meet.MEET_EDIT_IP = undefined;
    meet.MEET_EDIT_TIME = undefined;
    meet.MEET_FORMS = undefined;

		return {
      ...meet,
      MEET_TOKEN: token,
			MEET_TOKEN_TIME: tokenTime,
			MEET_LOGIN_TIME: timeUtil.time(),
			MEET_LOGIN_CNT: cnt + 1
		}

  }


	// 登录  
	async workLogin(phone, openId) {
		let where;
		let meet;
		// 判断是否存在
		if(phone){
			where = {
				MEET_PHONE: phone,
			}
			meet = await MeetModel.getOne(where);
    }
    console.log("康桑music",meet);
    
		if (!meet){
      this.AppError('该账号不存在');
    }

		let cnt = meet.MEET_LOGIN_CNT;

		// 生成token
		let token = dataUtil.genRandomString(32);
		let tokenTime = timeUtil.time();
		let data = {
			MEET_TOKEN: token,
			MEET_TOKEN_TIME: tokenTime,
			MEET_LOGIN_TIME: timeUtil.time(),
			MEET_LOGIN_CNT: cnt + 1
		}
    await MeetModel.edit(where, data);
    
    meet.MEET_LOGIN_TIME = (!meet.MEET_LOGIN_TIME) ? '尚未登录' : timeUtil.timestamp2Time(meet.MEET_LOGIN_TIME);
    
    meet.MEET_ADD_IP = undefined;
    meet.MEET_ADD_TIME = undefined;
    meet.MEET_DAYS = undefined;
    meet.MEET_EDIT_IP = undefined;
    meet.MEET_EDIT_TIME = undefined;
    meet.MEET_FORMS = undefined;

		return {
      ...meet,
      MEET_TOKEN: token,
			MEET_TOKEN_TIME: tokenTime,
			MEET_LOGIN_TIME: timeUtil.time(),
			MEET_LOGIN_CNT: cnt + 1
		}

	}

	/** 修改自身密码 */
	async pwdWork(workId, oldPassword, password) {
		let where = {
			_id: workId,
			MEET_PASSWORD: md5Lib.md5(oldPassword),
		}
		let work = await MeetModel.getOne(where);
		if (!work)
			this.AppError('旧密码错误');

		let data = {
			MEET_PASSWORD: md5Lib.md5(password),
		}
		return await MeetModel.edit(workId, data);
	}

}

module.exports = WorkHomeService;