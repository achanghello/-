/**
 * Notes: 收藏模块业务逻辑
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2022-05-24 07:48:00 
 */

const BaseProjectService = require('./base_project_service.js');
const util = require('../../../framework/utils/util.js');
const BlackModel = require('../model/black_model'); 
const FavModel = require('../model/fav_model.js'); 

class BlackService extends BaseProjectService {

  /** 是否收藏 */
	async isBlack(userId, oid) {
		let where = {
			FAV_OID: oid,
			FAV_USER_ID: userId
		}
		let isBlack = await BlackModel.count(where);
		return {
			isBlack
		};
	}

	/**
	 * 更新某人收藏
	 * @param {*} userId 
	 * @param {*} oid 
	 * @param {*} cancelIfExist  已收藏的情况下是否取消
	 */
	async updateBlack(userId, oid, avatar, name, area, path, cancelIfExist = true) {

		let {
			isBlack
		} = await this.isBlack(userId, oid);
		if (isBlack > 0) {
			if (cancelIfExist) {
				// 取消
				await this.delBlack(userId, oid);
				return {
					isBlack: 0
				};
			} else
				return {
					isBlack: 1
				};
		}


		// 保存 
		let data = {};
		data.FAV_OID = oid;
		data.FAV_AVATAR = avatar;
		data.FAV_NAME = name;
		data.FAV_AREA = area;
		data.FAV_PATH = path;
		data.FAV_USER_ID = userId; 


		await BlackModel.insert(data);
 
		return {
			isBlack: 1
		};
	}

	/** 删除收藏 */
	async delBlack(userId, oid) {
		let where = {
			FAV_OID: oid,
			FAV_USER_ID: userId
		}
		let effect = await BlackModel.del(where);

		return {
			effect
		};
	}

	/** 我的收藏列表 */
	async getMyBlackList(userId, {
		search, // 搜索条件 
		sortType, // 搜索菜单
		sortVal, // 搜索菜单
		orderBy, // 排序  
		page,
		size,
		isTotal = true,
		oldTotal = 0
	}) {
		orderBy = orderBy || {
			'FAV_ADD_TIME': 'desc'
		};
		let fields = 'FAV_AVATAR,FAV_NAME,FAV_ADD_TIME,FAV_OID,FAV_AREA,FAV_PATH';

		let where = {};
		if (util.isDefined(search) && search) {
			where.FAV_TITLE = {
				$regex: '.*' + search,
				$options: 'i'
			};
		}
    where.FAV_USER_ID = userId;
    
    let result = await BlackModel.getList(where, fields, orderBy, page, size, isTotal, oldTotal);
    
    for (let i = 0; i < result.list.length; i++) {
      const element = result.list[i];
      where = {
				FAV_OID:element.FAV_OID
			};
      element.FAV_CNTFAV = await FavModel.count(where);
    }

    return result;

	}

}

module.exports = BlackService;