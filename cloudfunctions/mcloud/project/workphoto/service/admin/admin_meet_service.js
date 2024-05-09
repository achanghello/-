/**
 * Notes: 预约后台管理
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2021-12-08 07:48:00 
 */

const BaseProjectAdminService = require('./base_project_admin_service.js');
const MeetService = require('../meet_service.js');
const AdminHomeService = require('../admin/admin_home_service.js');
const dataUtil = require('../../../../framework/utils/data_util.js');
const timeUtil = require('../../../../framework/utils/time_util.js');
const setupUtil = require('../../../../framework/utils/setup/setup_util.js');
const util = require('../../../../framework/utils/util.js');
const cloudUtil = require('../../../../framework/cloud/cloud_util.js');
const cloudBase = require('../../../../framework/cloud/cloud_base.js');
const md5Lib = require('../../../../framework/lib/md5_lib.js');

const MeetModel = require('../../model/meet_model.js');
const JoinModel = require('../../model/join_model.js');
const DayModel = require('../../model/day_model.js');
const TempModel = require('../../model/temp_model.js');

const exportUtil = require('../../../../framework/utils/export_util.js');


// 导出报名数据KEY
const EXPORT_JOIN_DATA_KEY = 'EXPORT_JOIN_DATA';

class AdminMeetService extends BaseProjectAdminService {




	/** 预约数据列表 */
	async getDayList(meetId, start, end) {
		let where = {
			DAY_MEET_ID: meetId,
			day: ['between', start, end]
		}
		let orderBy = {
			day: 'asc'
		}
		return await DayModel.getAllBig(where, 'day,times,dayDesc', orderBy);
	}

	// 按项目统计人数
	async statJoinCntByMeet(meetId) {
		let today = timeUtil.time('Y-M-D');
		let where = {
			day: ['>=', today],
			DAY_MEET_ID: meetId
		}

		let meetService = new MeetService();
		let list = await DayModel.getAllBig(where, 'DAY_MEET_ID,times', {}, 1000);
		for (let k = 0; k < list.length; k++) {
			let meetId = list[k].DAY_MEET_ID;
			let times = list[k].times;

			for (let j in times) {
				let timeMark = times[j].mark;
				meetService.statJoinCnt(meetId, timeMark);
			}
		}
	}

	/** 管理员按钮核销 */
	async checkinJoin(joinId, flag) {
		let join = await JoinModel.getOne(joinId);

		if (!join)
			this.AppError('没有该用户的预约记录，核销失败');

		if (join.JOIN_STATUS != JoinModel.STATUS.SUCC)
			this.AppError('该用户未预约成功，核销失败');


		let data = {
			JOIN_IS_CHECKIN: flag,
			JOIN_CHECKIN_TIME: flag == 0 ? 0 : this._timestamp,
		};
		await JoinModel.edit(joinId, data);
	}

	/** 管理员扫码核销 */
	async scanJoin(meetId, code) {
		let where = {
			JOIN_MEET_ID: meetId,
			JOIN_CODE: code
		}
		let join = await JoinModel.getOne(where);

		if (!join)
			this.AppError('没有该用户的预约记录，核销失败');

		if (join.JOIN_STATUS != JoinModel.STATUS.SUCC)
			this.AppError('该用户未预约成功，核销失败');

		if (join.JOIN_IS_CHECKIN == 1)
			this.AppError('该用户已核销，无须重复核销');

		let data = {
			JOIN_IS_CHECKIN: 1,
			JOIN_CHECKIN_TIME: this._timestamp,
    };
    let result = await JoinModel.edit(where, data);

    return join._id;
	}

	/**
	 * 判断本日是否有预约记录
	 * @param {*} daySet daysSet的节点
	 */
	checkHasJoinCnt(times) {
		if (!times) return false;
		for (let k = 0; k < times.length; k++) {
			if (times[k].stat.succCnt) return true;
		}
		return false;
	}

	// 判断含有预约的日期
	getCanModifyDaysSet(daysSet) {
		let now = timeUtil.time('Y-M-D');

		for (let k = 0; k < daysSet.length; k++) {
			if (daysSet[k].day < now) continue;
			daysSet[k].hasJoin = this.checkHasJoinCnt(daysSet[k].times);
		}

		return daysSet;
	}

	/** 取消某个时间段的所有预约记录 */
	async cancelJoinByTimeMark(meetId, timeMark, reason) {
		let where = {
			JOIN_MEET_TIME_MARK: timeMark,
			JOIN_MEET_ID: meetId,
			JOIN_STATUS: JoinModel.STATUS.SUCC
		};

		let data = {
			JOIN_STATUS: JoinModel.STATUS.ADMIN_CANCEL,

			JOIN_REASON: dataUtil.fmtText(reason),
			JOIN_EDIT_ADMIN_TIME: this._timestamp

		}


		// 更改数据库
		await JoinModel.edit(where, data);

		// 重新统计
		let meetService = new MeetService();
		await meetService.statJoinCnt(meetId, timeMark);

		let whereMeet = {
			_id: meetId
		}
		let meet = await meetService.getMeetOneDay(meetId, meetService.getDayByTimeMark(timeMark), whereMeet, 'MEET_ID');

		if (!meet) this.AppError('找不到该记录');
		let timeSet = meetService.getTimeSetByTimeMark(meet, timeMark);
		return timeSet.stat;

	}

	// 更新forms信息
	async updateMeetForms({
		id,
		hasImageForms
	}) {
		await MeetModel.editForms(id, 'MEET_FORMS', 'MEET_OBJ', hasImageForms);

	}


	/**添加 */
	async insertMeet(openId,adminId, {
		phone
	}) {
    let where;
    if (phone) {
			where = {
				MEET_PHONE: phone,
				// MEET_MINI_OPENID:openId
			}
			let haved = await MeetModel.getOne(where);
			if (haved){
        console.log("已经有了",haved);
				return {
					id: haved._id
				}
			}
    }

		// 赋值 
    let data = {};
    if(phone!==undefined){
      data.MEET_PHONE = phone;
    }
    if(openId){
      data.MEET_MINI_OPENID = openId
    }
  
    let id = await MeetModel.insert(data);

		let qr = await this.genDetailQr('meet', id);
    MeetModel.edit(id, { MEET_QR: qr });
    
    console.log("还没有",id);
    
		return {
			id
		};
	}


	/**排期设置 */
	async setDays(id, {
		daysSet,
	}) {

		let data = {};
		data.MEET_DAYS = dataUtil.getArrByKey(daysSet, 'day');

		await MeetModel.edit(id, data);

		await this._editDays(id, timeUtil.time('Y-M-D'), daysSet);

	}


	/**删除数据 */
	async delMeet(id) {
		let where = {
			_id: id
		}

		// 取出图片数据
		let meet = await MeetModel.getOne(where, 'MEET_FORMS,MEET_QR');
		if (!meet) return;

		await MeetModel.del(where);

		let whereDay = { DAY_MEET_ID: id };
		DayModel.del(whereDay);

		// 异步删除图片  
		cloudUtil.handlerCloudFilesForForms(meet.MEET_FORMS, []);
		cloudUtil.deleteFiles(meet.MEET_QR);

	}

	/**获取信息 */
	async getMeetDetail(id) {
		let fields = '*';

		let where = {
			_id: id
		}
    let meet = await MeetModel.getOne(where, fields);
		if (!meet) return null;

		let meetService = new MeetService();
    meet.MEET_DAYS_SET = await meetService.getDaysSet(id, timeUtil.time('Y-M-D')); //今天及以后
    
    meet.notice = await meetService.getNotices(id, meet.MEET_CATE_ID);

    console.log("红尘",meet);
		return meet;
	}


	/** 更新日期设置 */
	async _editDays(meetId, nowDay, daysSetData) {
		// 删除指定日期之后的记录（含)
		let where = {
			DAY_MEET_ID: meetId,
			day: ['>=', nowDay]
		}
		await DayModel.del(where);

		// 插入指定日期之后的记录
		for (let k = 0; k < daysSetData.length; k++) {
			daysSetData[k].DAY_MEET_ID = meetId;
		}
		await DayModel.insertBatch(daysSetData);
	}

	/**更新数据 */
	async editMeet({
    id,
    cateId,
    cateName,
    
    cancelSet,
    daysSet,
    phone,
    forms,
		joinForms,
    order,
    status,
    area
	}) {


    let where;
		if (phone) {
			where = {
				MEET_PHONE: phone,
				_id: ['<>', id]
			}
			if (await MeetModel.count(where))
				this.AppError('该登陆手机已经存在');
		}
		// 赋值 
    let data = {};
    if(cateId!==undefined){
      data.MEET_CATE_ID = cateId;
    }
    if(cateName!==undefined){
      data.MEET_CATE_NAME = cateName;
    }
    if(cancelSet!==undefined){
      data.MEET_CANCEL_SET = cancelSet;
    }
    if(daysSet){
      // 业务处理
      for (let k = 0; k < daysSet.length; k++) {
        // 时间段正序排列
        let times = daysSet[k].times;
        times.sort(dataUtil.objArrSortAsc('start'));
        daysSet[k].times = times;
      }
    }
    if(phone!==undefined){
      data.MEET_PHONE = phone;
    }
    if(forms!==undefined){
      data.MEET_FORMS = forms;
      data.MEET_OBJ = forms?dataUtil.dbForms2Obj(forms):forms;
    }
    if(joinForms!==undefined){
      data.MEET_JOIN_FORMS = joinForms;
    }
    if(order!==undefined){
      data.MEET_ORDER = order;
    }
    if(status!==undefined){
      data.MEET_STATUS = status;
    }
    if(daysSet){
      data.MEET_DAYS = dataUtil.getArrByKey(daysSet, 'day');
    }
    if(area){
      data.MEET_AREA = area
    }
	
		await MeetModel.edit(id, data);

		// 插入日期设置 (DAY表)
		if(daysSet){
			await this._editDays(id, timeUtil.time('Y-M-D'), daysSet);
		}

		// 人数统计修正
		this.statJoinCntByMeet(id);

		// 小程序码
		// let qr = await this.genDetailQr('meet', id);
		// MeetModel.edit(id, { MEET_QR: qr });


	}

	/**预约名单分页列表 */
	async getJoinList({
		search, // 搜索条件
		sortType, // 搜索菜单
		sortVal, // 搜索菜单
		orderBy, // 排序
		meetId,
		mark,
		page,
		size,
		isTotal = true,
		oldTotal
	}) {

		orderBy = orderBy || {
			'JOIN_ADD_TIME': 'desc'
		};
		let fields = 'JOIN_IS_CHECKIN,JOIN_CHECKIN_TIME,JOIN_CODE,JOIN_ID,JOIN_REASON,JOIN_USER_ID,JOIN_MEET_ID,JOIN_MEET_TITLE,JOIN_MEET_DAY,JOIN_MEET_TIME_START,JOIN_MEET_TIME_END,JOIN_MEET_TIME_MARK,JOIN_FORMS,JOIN_STATUS,JOIN_ADD_TIME';

		let where = {
			JOIN_MEET_ID: meetId,
			JOIN_MEET_TIME_MARK: mark
		};
		if (util.isDefined(search) && search) {
			where['JOIN_FORMS.val'] = {
				$regex: '.*' + search,
				$options: 'i'
			};
		} else if (sortType && util.isDefined(sortVal)) {
			// 搜索菜单
			switch (sortType) {
				case 'status':
					// 按类型
					sortVal = Number(sortVal);
					if (sortVal == 1099) //取消的2种
						where.JOIN_STATUS = ['in', [10, 99]]
					else
						where.JOIN_STATUS = Number(sortVal);
					break;
				case 'checkin':
					// 核销
					where.JOIN_STATUS = JoinModel.STATUS.SUCC;
					if (sortVal == 1) {
						where.JOIN_IS_CHECKIN = 1;
					} else {
						where.JOIN_IS_CHECKIN = 0;
					}
					break;
			}
		}

		return await JoinModel.getList(where, fields, orderBy, page, size, isTotal, oldTotal);
	}

	/**预约项目分页列表 */
	async getAdminMeetList({
		search, // 搜索条件
		sortType, // 搜索菜单
		sortVal, // 搜索菜单
		orderBy, // 排序
		whereEx, //附加查询条件
		page,
		size,
		isTotal = true,
		oldTotal
	}) {

		orderBy = orderBy || {
			'MEET_ORDER': 'asc',
			'MEET_ADD_TIME': 'desc'
		};
		let fields = 'MEET_CATE_ID,MEET_CATE_NAME,MEET_TITLE,MEET_STATUS,MEET_DAYS,MEET_ADD_TIME,MEET_EDIT_TIME,MEET_ORDER,MEET_VOUCH,MEET_QR';

		let where = {};
		if (util.isDefined(search) && search) {
			where.MEET_TITLE = {
				$regex: '.*' + search,
				$options: 'i'
			};
		} else if (sortType && util.isDefined(sortVal)) {
			// 搜索菜单
			switch (sortType) {
				case 'status': {
					// 按类型
					where.MEET_STATUS = Number(sortVal);
					break;
				}
				case 'cateId': {
					// 按类型
					where.MEET_CATE_ID = sortVal;
					break;
				}
				case 'vouch': {
					where.MEET_VOUCH = 1;
					break;
				}
				case 'top': {
					where.MEET_ORDER = 0;
					break;
				}
			}
		}

		return await MeetModel.getList(where, fields, orderBy, page, size, isTotal, oldTotal);
	}

	/** 删除 */
	async delJoin(joinId) {
		let join = await JoinModel.getOne(joinId);
		if (!join) this.AppError('找不到该记录');

		await JoinModel.del(joinId);


		// 重新统计  
		let meetService = new MeetService();
		await meetService.statJoinCnt(join.JOIN_MEET_ID, join.JOIN_MEET_TIME_MARK);

		// 返回统计信息
		let whereMeet = {
			_id: join.JOIN_MEET_ID
		}
		let meet = await meetService.getMeetOneDay(join.JOIN_MEET_ID, join.JOIN_MEET_DAY, whereMeet, 'MEET_ID');
		if (!meet) this.AppError('找不到该记录');
		let timeSet = meetService.getTimeSetByTimeMark(meet, join.JOIN_MEET_TIME_MARK);
		return timeSet.stat;

	}

	/**修改报名状态 
	 * 特殊约定 99=>正常取消 
	 */
	async statusJoin(joinId, status, reason = '') {
		let where = {
			_id: joinId,
			JOIN_STATUS: ['<>', status]
		}
		let join = await JoinModel.getOne(where);
		if (!join) this.AppError('找不到该记录');

		let data = {
			JOIN_STATUS: status,
			JOIN_IS_CHECKIN: 0, //取消核销

			JOIN_REASON: (status == 99) ? dataUtil.fmtText(reason) : '',

			// 操作管理员信息记载 
			JOIN_EDIT_ADMIN_TIME: this._timestamp
		}
		await JoinModel.edit(where, data);

		let meetService = new MeetService();



		// 重新统计  
		await meetService.statJoinCnt(join.JOIN_MEET_ID, join.JOIN_MEET_TIME_MARK);

		// 返回统计信息
		let whereMeet = {
			_id: join.JOIN_MEET_ID
		}
		let meet = await meetService.getMeetOneDay(join.JOIN_MEET_ID, join.JOIN_MEET_DAY, whereMeet, 'MEET_ID');

		if (!meet) this.AppError('找不到该记录');
		let timeSet = meetService.getTimeSetByTimeMark(meet, join.JOIN_MEET_TIME_MARK);
		return timeSet.stat;
	}

	/**修改项目状态 */
	async statusMeet(id, status) {
		let data = {
			MEET_STATUS: status
		}
		let where = {
			_id: id,
		}
		return await MeetModel.edit(where, data);
	}

	/**置顶排序设定 */
	async sortMeet(id, sort) {
		sort = Number(sort)
		let data = {
			MEET_ORDER: sort
		}
		await MeetModel.edit(id, data);
	}

	/**首页设定 */
	async vouchMeet(id, vouch) {
		let data = { MEET_VOUCH: Number(vouch) };
		await MeetModel.edit(id, data);

	}

	//##################模板
	/**添加模板 */
	async insertMeetTemp({
		name,
		times,
	}, meetId = 'admin') {

		// 重复性判断
		let where = {
			TEMP_NAME: name,
			TEMP_MEET_ID: meetId,
		}
		if (await TempModel.count(where))
			this.AppError('该模板名称已经存在');

		// 赋值 
		let data = {};
		data.TEMP_NAME = name;
		data.TEMP_TIMES = times;
		data.TEMP_MEET_ID = meetId;

		let id = await TempModel.insert(data);

		return id;

	}

	/**更新数据 */
	async editMeetTemp({
		id,
		limit,
		isLimit
	}, meetId = 'admin') {

		limit = Number(limit);

		// 赋值 
		let data = {};
		data['TEMP_TIMES.$[].limit'] = limit;
		data['TEMP_TIMES.$[].isLimit'] = isLimit;

		let where = {
			_id: id,
			TEMP_MEET_ID: meetId
		}

		await TempModel.edit(where, data);

		return await this.getMeetTempList(meetId);
	}


	/**删除数据 */
	async delMeetTemp(id, meetId = 'admin') {
		let where = {
			_id: id,
			TEMP_MEET_ID: meetId
		}

		return await TempModel.del(where);;

	}


	/**模板列表 */
	async getMeetTempList(meetId = 'admin') {
		let orderBy = {
			'TEMP_ADD_TIME': 'desc'
		};
		let fields = 'TEMP_NAME,TEMP_TIMES';

		let where = {
			TEMP_MEET_ID: meetId
		};
		return await TempModel.getAll(where, fields, orderBy);
	}

	// #####################导出报名数据
	/**获取报名数据 */
	async getJoinDataURL() {
		return await exportUtil.getExportDataURL(EXPORT_JOIN_DATA_KEY);
	}

	/**删除报名数据 */
	async deleteJoinDataExcel() {
		return await exportUtil.deleteDataExcel(EXPORT_JOIN_DATA_KEY);
	}

	/**导出报名数据 */
	async exportJoinDataExcel({
		meetId,
		startDay,
		endDay,
		status
	}) {
		// 取得meet的表单设置
		let meet = await MeetModel.getOne(meetId, 'MEET_JOIN_FORMS');
		if (!meet) return;
		let joinForms = meet.MEET_JOIN_FORMS;

		let where = {
			JOIN_MEET_ID: meetId,
			JOIN_MEET_DAY: [
				['>=', startDay],
				['<=', endDay]
			]
		};
		if (status != 999)
			where.JOIN_STATUS = status;


		// 计算总数
		let total = await JoinModel.count(where);

		// 定义存储数据 
		let data = [];

		const options = {
			'!cols': [
				{ column: '序号', wch: 8 },
				{ column: '日期', wch: 15 },
				{ column: '时段', wch: 28 },
				{ column: '状态', wch: 18 },
				...dataUtil.getTitleByForm(joinForms),
				{ column: '创建时间', wch: 25 },
				{ column: '是否核销', wch: 15 }
			]
		};

		// 标题栏
		let ROW_TITLE = options['!cols'].map((item) => (item.column));
		data.push(ROW_TITLE);

		// 按每次100条导出数据
		let size = 100;
		let page = Math.ceil(total / size);
		let orderBy = {
			'JOIN_MEET_TIME_START': 'asc',
			'JOIN_EDIT_TIME': 'asc'
		}

		let order = 0;
		for (let i = 1; i <= page; i++) {
			let list = await JoinModel.getList(where, '*', orderBy, i, size, false);
			console.log('[ExportJoin] Now export cnt=' + list.list.length);

			for (let k = 0; k < list.list.length; k++) {
				let node = list.list[k];

				order++;

				// 数据节点
				let arr = [];
				arr.push(order);

				arr.push(node.JOIN_MEET_DAY);
				arr.push(node.JOIN_MEET_TIME_START + '-' + node.JOIN_MEET_TIME_END);

				arr.push(JoinModel.getDesc('STATUS', node.JOIN_STATUS));

				// 表单
				for (let k = 0; k < joinForms.length; k++) {
					arr.push(dataUtil.getValByForm(node.JOIN_FORMS, joinForms[k].mark, joinForms[k].title));
				}

				// 创建时间
				arr.push(timeUtil.timestamp2Time(node.JOIN_EDIT_TIME, 'Y-M-D h:m:s'));

				if (node.JOIN_STATUS == 1 && node.JOIN_IS_CHECKIN == 1) {
					arr.push('已核销')
				} else {
					arr.push('')
				}

				data.push(arr);
			}

		}

		return await exportUtil.exportDataExcel(EXPORT_JOIN_DATA_KEY, '报名数据', total, data, options);

	}

  /** 获取手机号码 */
	async getPhone(cloudID) {
		let cloud = cloudBase.getCloud();
		let res = await cloud.getOpenData({
			list: [cloudID], // 假设 event.openData.list 是一个 CloudID 字符串列表
		});
		if (res && res.list && res.list[0] && res.list[0].data) {

			let phone = res.list[0].data.phoneNumber;

			return phone;
		} else
			return '';
	}
}

module.exports = AdminMeetService;