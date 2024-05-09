/**
 * Notes: 全局/首页模块业务逻辑
 * Date: 2021-03-15 04:00:00 
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 */

const BaseProjectService = require('./base_project_service.js');
const setupUtil = require('../../../framework/utils/setup/setup_util.js');
const timeUtil = require('../../../framework/utils/time_util.js');
const NewsModel = require('../model/news_model.js');
const MeetModel = require('../model/meet_model.js');
const FavModel = require('../model/fav_model');

class HomeService extends BaseProjectService {

	async getSetup(key) {
		return await setupUtil.get(key);
	}

	/**首页列表 */
	async getHomeList(that) {
    let city = undefined;
    if(that._request.city!=='全国'){
      city = that._request.city
    }
		let where = {
			MEET_STATUS: 1,
      MEET_CATE_ID: 1,
      "MEET_OBJ.area":city
		};
		let orderBy = {
			'MEET_VOUCH': 'desc',
			'MEET_ORDER': 'asc',
			'MEET_ADD_TIME': 'desc'
		}
    let fields = 'MEET_OBJ.name,MEET_OBJ.avatar,MEET_OBJ.area';
    let meetList;
    if(that._request.userId){
      meetList = await MeetModel.getAllSinger(that._request.userId, where, fields, orderBy, 10);
    }else{
      meetList = await MeetModel.getAll(where, fields, orderBy, 10);
    } 
    console.log("结果--------",meetList);
		for (let k = 0; k < meetList.length; k++) {
			where = {
				FAV_OID:meetList[k]._id
			};
      meetList[k].favedCnt = await FavModel.count(where);
      if(that._request.userId){
        where = {
          FAV_OID:meetList[k]._id,
          FAV_USER_ID:that._request.userId
        };
        meetList[k].collected = await FavModel.count(where);
      }
		}
		return { meetList }
	}
}

module.exports = HomeService;