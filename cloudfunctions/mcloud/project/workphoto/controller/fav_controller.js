/**
 * Notes: 预约模块控制器
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2021-12-10 04:00:00 
 */

const BaseProjectController = require('./base_project_controller.js');
const FavService = require('../service/fav_service.js');
const timeUtil = require('../../../framework/utils/time_util.js');

class FavController extends BaseProjectController {

	/** 更新某人收藏 */
	async updateFav() {
		// 数据校验
		let rules = {
      oid: 'id|must',
      userId: 'string|must',
			path: 'string|must',
			avatar: 'string',
			name: 'string',
			cntFav: 'int',
			area: 'string',
		};

		// 取得数据
		let input = this.validateData(rules);

    let service = new FavService();
		return await service.updateFav(input.userId, input.oid, input.avatar, input.name, input.cntFav, input.area,input.path);
	}


	/** 删除收藏 */
	async delFav() {
		// 数据校验
		let rules = {
      oid: 'id|must',
      userId: 'string|must',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new FavService();
		return await service.updateFav(input.userId, input.oid);
	}


	/** 是否收藏 */
	async isFav() {
		// 数据校验
		let rules = {
      oid: 'id|must',
      userId: 'string|must',
		};

		// 取得数据
		let input = this.validateData(rules);

		let service = new FavService();
		return await service.isFav(input.userId, input.oid);
	}

	/** 我的收藏列表 */
	async getMyFavList() {
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
      userId: 'string'
		};

		// 取得数据
    let input = this.validateData(rules);
    
    if(!input.userId){
      return {
        count: 0,
        list: [],
        page: 1,
        size: 20,
        total: 0
      }
    }

    let service = new FavService();
		let result = await service.getMyFavList(input.userId, input);

		// 数据格式化
		let list = result.list;
		// 显示转换
		for (let k = 0; k < list.length; k++) {
			list[k].FAV_ADD_TIME = timeUtil.timestamp2Time(list[k].FAV_ADD_TIME);
		}
    result.list = list;
    
    console.log("结果",result);

		return result;

	}

}

module.exports = FavController;