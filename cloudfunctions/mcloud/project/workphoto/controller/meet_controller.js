/**
 * Notes: 预约模块控制器
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2021-12-10 04:00:00 
 */

const BaseProjectController = require('./base_project_controller.js');
const MeetService = require('../service/meet_service.js');
const timeUtil = require('../../../framework/utils/time_util.js');
const JoinModel = require('../model/join_model.js');

class MeetController extends BaseProjectController {


	// 把列表转换为显示模式
	transMeetList(list) {
		let ret = [];
		for (let k = 0; k < list.length; k++) {
			let node = {};
			node.type = 'meet';
			node.id = list[k]._id;
			node.title = list[k].MEET_TITLE;
			node.desc = list[k].MEET_OBJ.desc;
			node.ext = list[k].openRule;
			node.pic = list[k].MEET_OBJ.cover;
			ret.push(node);
		}
		return ret;
	}


	/** 按天获取预约项目 */
	async getMeetListByDay() {

		// 数据校验
		let rules = {
			day: 'must|date|name=日期',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new MeetService();
		let list = await service.getMeetListByDay(input.day);
		return list;


	}

	/** 获取从某天开始可预约的日期 */
	async getHasDaysFromDay() {

		// 数据校验
		let rules = {
			day: 'must|date|name=日期',
		};

		// 取得数据
		let input = this.validateData(rules);


		let service = new MeetService();
		let list = await service.getHasDaysFromDay(input.day);
		return list;

	}

	/** 预约列表 */
	async getMeetList() {

		// 数据校验
		let rules = {
			search: 'string|min:1|max:30|name=搜索条件',
			sortType: 'string|name=搜索类型',
			sortVal: 'name=搜索类型值',
			orderBy: 'object|name=排序',
			cateId: 'string',
			page: 'must|int|default=1',
			size: 'int',
			isTotal: 'bool',
      oldTotal: 'int',
      userId: 'string'
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new MeetService();
		let result = await service.getMeetList(input,this);

		// 数据格式化
		let list = result.list;

		for (let k = 0; k < list.length; k++) {
			list[k].openRule = this._getLeaveDay(list[k].MEET_DAYS) + '天可预约';
		}

		//result.list = this.transMeetList(list);

		return result;

	}

	/** 我的预约列表 */
	async getMyJoinList() {

		// 数据校验
		let rules = {
			search: 'string|min:1|max:30|name=搜索条件',
			sortType: 'string|name=搜索类型',
			sortVal: 'name=搜索类型值',
			orderBy: 'object|name=排序',
			page: 'must|int|default=1',
			size: 'int',
			isTotal: 'bool',
			oldTotal: 'int',
      workId: 'string',
      userId: 'string'
		};

		// 取得数据
    let input = this.validateData(rules);
    console.log("目标",input);

		let service = new MeetService();
		let result = await service.getMyJoinList(input.userId, input);

		// 数据格式化
		let list = result.list;


		let now = timeUtil.time('Y-M-D h:m');

		for (let k = 0; k < list.length; k++) {

			list[k].JOIN_MEET_DAY = timeUtil.fmtDateCHN(list[k].JOIN_MEET_DAY) + ' (' + timeUtil.week(list[k].JOIN_MEET_DAY) + ')';

			if (now > list[k].JOIN_COMPLETE_END_TIME
				&& list[k].JOIN_STATUS == 1
				&& list[k].JOIN_IS_CHECKIN == 0)
				list[k].isTimeout = 1;
			else
				list[k].isTimeout = 0;

			list[k].JOIN_ADD_TIME = timeUtil.timestamp2Time(list[k].JOIN_ADD_TIME, 'Y-M-D h:m');
		}

		result.list = list;

		return result;

  }
  
  async getMyJoinListByDate() {
    // 数据校验
		let rules = {
      date: 'must|string|name=日期',
      phone: 'must|string|name=手机号',
      userId: 'string'
		};
		// 取得数据
    let input = this.validateData(rules);

		let service = new MeetService();
		let result = await service.getMyJoinListByDate(input.userId, input.phone, input);

		// 数据格式化
		let list = result.list;


		let now = timeUtil.time('Y-M-D h:m');

		for (let k = 0; k < list.length; k++) {

			list[k].JOIN_MEET_DAY = timeUtil.fmtDateCHN(list[k].JOIN_MEET_DAY) + ' (' + timeUtil.week(list[k].JOIN_MEET_DAY) + ')';

			if (now > list[k].JOIN_COMPLETE_END_TIME
				&& list[k].JOIN_STATUS == 1
				&& list[k].JOIN_IS_CHECKIN == 0)
				list[k].isTimeout = 1;
			else
				list[k].isTimeout = 0;

			list[k].JOIN_ADD_TIME = timeUtil.timestamp2Time(list[k].JOIN_ADD_TIME, 'Y-M-D h:m');
		}

		result.list = list;

		return result;
  }

	/** 我的某日预约列表 */
	async getMyJoinSomeday() {
		// 数据校验
		let rules = {
      day: 'must|date|name=日期',
      userId: 'string'
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new MeetService();
		let list = await service.getMyJoinSomeday(input.userId, input.day);

		// 数据格式化  
		for (let k = 0; k < list.length; k++) {

		}

		return list;

	}

	/** 我的预约详情 */
	async getMyJoinDetail() {
		// 数据校验
		let rules = {
      joinId: 'must|id',
      userId: 'string'
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new MeetService();
		let join = await service.getMyJoinDetail(input.userId, input.joinId);
		if (join) {

			let now = timeUtil.time('Y-M-D h:m');
			if (now > join.JOIN_COMPLETE_END_TIME
				&& join.JOIN_STATUS == 1
				&& join.JOIN_IS_CHECKIN == 0)
				join.isTimeout = 1;
			else
				join.isTimeout = 0;

			join.JOIN_STATUS_DESC = JoinModel.getDesc('STATUS', join.JOIN_STATUS);
			join.JOIN_ADD_TIME = timeUtil.timestamp2Time(join.JOIN_ADD_TIME);
			join.JOIN_CHECKIN_TIME = timeUtil.timestamp2Time(join.JOIN_CHECKIN_TIME);
		}
		return join;

	}

	/** 用户预约取消 */
	async cancelMyJoin() {

		// 数据校验
		let rules = {
      joinId: 'must|id',
      userId: 'string'
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new MeetService();
		return await service.cancelMyJoin(input.userId, input.joinId);
	}


	/**  预约前获取关键信息 */
	async detailForJoin() {
		// 数据校验
		let rules = {
			meetId: 'must|meetId',
      timeMark: 'must|string',
      userId: 'string'
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new MeetService();
		let meet = await service.detailForJoin(input.userId, input.meetId, input.timeMark);

		if (meet) {
			// 显示转换  
		}

		return meet;
	}

	/** 浏览预约信息 */
	async viewMeet() {
		// 数据校验
		let rules = {
			id: 'must|id',
		};

		// 取得数据
		let input = this.validateData(rules);
    
		let service = new MeetService();
		let meet = await service.viewMeet(input.id);
		if (meet) {
			// 显示转换  
		}

		return meet;
	}

	/** 预约前检测 */
	async beforeJoin() {
		// 数据校验
		let rules = {
			meetId: 'must|id',
      timeMark: 'must|string',
      userId: 'string'
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new MeetService();
		return await service.beforeJoin(input.userId, input.meetId, input.timeMark);
	}

	/** 预约提交 */
	async join() {
		// 数据校验
		let rules = {
			meetId: 'must|id',
			timeMark: 'must|string',
      formsList: 'must|array',
      address: 'must|string',
      userId: 'string'
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new MeetService();
		return await service.join(input.userId, input.meetId, input.timeMark, input.formsList, input.address);
	}


	// 计算可约天数
	_getLeaveDay(days) {
		let now = timeUtil.time('Y-M-D');
		let count = 0;
		for (let k = 0; k < days.length; k++) {
			if (days[k] >= now) count++;
		}
		return count;
  }

  async editJoin() {

    // 数据校验
		let rules = {
			joinId: 'must|id',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new MeetService();
		return await service.editJoin(input.joinId);
	}

}

module.exports = MeetController;