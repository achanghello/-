/**
 * Notes: 预约模块业务逻辑
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2021-12-10 07:48:00 
 */

const BaseBiz = require('./base_biz.js');
const cloudHelper = require('../../helper/cloud_helper.js');
const pageHelper = require('../../helper/page_helper.js');
const WorkBiz = require('../../projects/workphoto/biz/work_biz');

class BlackBiz extends BaseBiz {

  static async isBlack(that, oid) {
    if (!oid) return;

		that.setData({
			isBlack: 0
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
		cloudHelper.callCloudSumbit('black/is_black', params, { title: 'bar' }).then(result => {
      console.log("123456",result);
			that.setData({
				isBlack: result.data.isBlack
			});
		}).catch(error => { })
	}

	static async updateBlack(that, oid, isBlack, avatar, name, area) {
    let path = pageHelper.getCurrentPageUrlWithArgs();
    if (!oid || !path ) return;

    let userId = WorkBiz.getWorkId()

    if(!userId){
      return
    }

		let params = {
      userId,
			oid,
      avatar, 
      name, 
      area,
			path
		}
		let opts = {
			title: (isBlack == 0) ? '拉黑中' : '取消中'
		}
		try {
			let result = await cloudHelper.callCloudSumbit('black/update', params, opts);
			that.setData({
				isBlack: result.data.isBlack,
			});
		} catch (e) {
			console.log(e);
		}
	}
}

module.exports = BlackBiz;