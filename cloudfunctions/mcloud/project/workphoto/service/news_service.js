/**
 * Notes: 资讯模块业务逻辑
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2020-10-29 07:48:00 
 */

const BaseProjectService = require('./base_project_service.js');
const util = require('../../../framework/utils/util.js');
const NewsModel = require('../model/news_model.js');

class NewsService extends BaseProjectService {

	/** 浏览资讯信息 */
	async viewNews(id) {

		let fields = '*';

		let where = {
			_id: id,
			NEWS_STATUS: 1
		}
		let news = await NewsModel.getOne(where, fields);
		if (!news) return null;



		return news;
  }
  

	/** 取得分页列表 */
	async getNewsList({
		cateId, 
		search, // 搜索条件
		sortType, // 搜索菜单
		sortVal, // 搜索菜单
		orderBy, // 排序 
		page,
		size,
		isTotal = true,
		oldTotal
	},identifyId,realMeetId) {

		orderBy = orderBy || {
			'NEWS_ADD_TIME': 'desc'
		};
		// let fields = 'JOIN_ID,JOIN_MEET_NAME,JOIN_MEET_ADDRESS,JOIN_MEET_TYPE,NEWS_ADD_TIME';
    let fields = '';

    let where = {};
    
    if(identifyId===1){
      where.JOIN_MEET_ID=realMeetId;
    }else{
      where.JOIN_USER_ID=realMeetId;
    }
		// where.and = {
		// 	_pid: this.getProjectId() //复杂的查询在此处标注PID
		// };
		// where.NEWS_STATUS = 1; // 状态 

		if (cateId && cateId !== '0') where.and.NEWS_CATE_ID = cateId;

		if (util.isDefined(search) && search) {
			where.or = [
				{ NEWS_TITLE: ['like', search] },
			];
		} else if (sortType && util.isDefined(sortVal)) {
			// 搜索菜单
			switch (sortType) {
				case 'sort': {
					orderBy = this.fmtOrderBySort(sortVal, 'NEWS_ADD_TIME');
					break;
				}
				case 'cateId': {
					if (sortVal) where.and.NEWS_CATE_ID = String(sortVal);
					break;
				}
			}
    }
		return await NewsModel.getList(where, fields, orderBy, page, size, isTotal, oldTotal);
	}  

}

module.exports = NewsService;