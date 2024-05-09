/**
 * Notes: 收藏模块业务逻辑
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2022-05-24 07:48:00 
 */

const BaseProjectService = require('./base_project_service.js');
const util = require('../../../framework/utils/util.js');
const FavModel = require('../model/fav_model.js'); 

class FavService extends BaseProjectService {

	/** 是否收藏 */
	async isFav(userId, oid) {
		let where = {
			FAV_OID: oid,
			FAV_USER_ID: userId
		}
		let isFav = await FavModel.count(where);
		return {
			isFav
		};
	}

	/**
	 * 更新某人收藏
	 * @param {*} userId 
	 * @param {*} oid 
	 * @param {*} cancelIfExist  已收藏的情况下是否取消
	 */
	async updateFav(userId, oid, avatar, name, cntFav, area, path, cancelIfExist = true) {
    console.log("333");
		let {
			isFav
		} = await this.isFav(userId, oid);
		if (isFav > 0) {
			if (cancelIfExist) {
				// 取消
				await this.delFav(userId, oid);
				return {
					isFav: 0
				};
			} else
				return {
					isFav: 1
				};
		}


		// 保存 
		let data = {};
		data.FAV_OID = oid;
		data.FAV_AVATAR = avatar;
		data.FAV_NAME = name;
		data.FAV_CNTFAV = cntFav;
		data.FAV_AREA = area;
		data.FAV_PATH = path;
		data.FAV_USER_ID = userId; 


		await FavModel.insert(data);
 
		return {
			isFav: 1
		};
	}

	/** 删除收藏 */
	async delFav(userId, oid) {
		let where = {
			FAV_OID: oid,
			FAV_USER_ID: userId
		}
		let effect = await FavModel.del(where);

		return {
			effect
		};
	}

	/** 我的收藏列表 */
	async getMyFavList(userId, {
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
		let fields = 'FAV_AVATAR,FAV_NAME,FAV_CNTFAV,FAV_ADD_TIME,FAV_OID,FAV_AREA,FAV_PATH';

		let where = {};
		if (util.isDefined(search) && search) {
			where.FAV_TITLE = {
				$regex: '.*' + search,
				$options: 'i'
			};
		}
		where.FAV_USER_ID = userId;

    let result = await FavModel.getList(where, fields, orderBy, page, size, isTotal, oldTotal);
    
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

module.exports = FavService;