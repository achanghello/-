/**
 * Notes: 预约模块业务逻辑
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2021-12-10 07:48:00 
 */

const BaseBiz = require('./base_biz.js');
const cloudHelper = require('../../helper/cloud_helper.js');
const WorkBiz = require('../../projects/workphoto/biz/work_biz');
const pageHelper = require('../../helper/page_helper.js'); 

class FavBiz extends BaseBiz {

	static async isFav(that, oid) {
    if (!oid) return;

		that.setData({
			isFav: -1
    });
    
    let userId = WorkBiz.getWorkId()

    if(!userId){
      return
    }

		// 异步获取是否收藏
		let params = {
      userId,
			oid
		};
		cloudHelper.callCloudSumbit('fav/is_fav', params, { title: 'bar' }).then(result => {
      console.log("123456",result);
			that.setData({
				isFav: result.data.isFav
			});
		}).catch(error => { })
	}

	static async updateFav(that, oid, isFav, avatar, name, cntFav, area) {
    console.log(123);
    let path = pageHelper.getCurrentPageUrlWithArgs();
    if (!oid || !path ) return;

    let userId = WorkBiz.getWorkId()
 
    if(!userId){
      pageHelper.showErrToast('请登录后操作',1500)
      return
    }
    

		let params = {
      userId,
			oid,
      avatar, 
      name, 
      cntFav, 
      area,
			path
		}
		let opts = {
			title: (isFav == 0) ? '收藏中' : '取消中'
		}
		try {
			let result = await cloudHelper.callCloudSumbit('fav/update', params, opts);
			that.setData({
				isFav: result.data.isFav,
			});
		} catch (e) {
			console.log(e);
		}
	}

  static async homeCollect(that, oid, isFav, avatar, name, cntFav, area,index,ziduan='meetList') {
    let path = `/projects/workphoto/pages/meet/detail/meet_detail?id=${oid}`
    if (!oid || !path) return;
    
    let userId = WorkBiz.getWorkId()

    if(!userId){
      return
    }

		let params = {
      userId,
			oid,
      avatar, name, cntFav, area,
			path
		}
		let opts = {
			title: (isFav == 0) ? '收藏中' : '取消中'
		}
		try {
      let result = await cloudHelper.callCloudSumbit('fav/update', params, opts);
      
      console.log("结果",result);
      let key = ziduan+"["+index+'].collected';
      let numkey = ziduan+"["+index+'].favedCnt';

      that.setData({
        [key]:(isFav == 0) ? 1 : 0,
        [numkey]:(isFav == 0)?cntFav+1:cntFav-1
      })
		} catch (e) {
			console.log(e);
		}
	}
}

module.exports = FavBiz;