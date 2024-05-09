/** 
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2020-10-29 07:48:00 
 */

const cacheHelper = require('../../../../../helper/cache_helper.js');
const constants = require('../../../../../comm/constants');
const pageHelper = require('../../../../../helper/page_helper.js');
const cloudHelper = require('../../../../../helper/cloud_helper.js');
const ProjectBiz = require('../../../biz/project_biz.js');
const AdminBiz = require('../../../../../comm/biz/admin_biz.js');
const WorkBiz = require('../../../biz/work_biz.js');
const setting = require('../../../../../setting/setting.js');
const PassportBiz = require('../../../../../comm/biz/passport_biz.js');

Page({
	data: {
    user:null,
    timestamp:''
  },
  onLoad(){
    this.setData({
      date:new Date().getFullYear()
    })
  },

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: async function () {
    this.setData({
      timestamp:new Date().getTime()
    })
    let isLoad = WorkBiz.isWork();
    if(isLoad){
      let res;
      try {
        res = await WorkBiz.loginSilence(this)
      } catch (error) {
        cacheHelper.clear()
      }
      
      if(res){
        this._loadUser();
      }else{
        this.setData({
          user:null
        });
      }
    }
	},


	_loadUser: async function (e) {
		let opts = {
			title: '加载中...'
    }

    let user = await cloudHelper.callCloudData('admin/meet_detail', {id:WorkBiz.getWorkId()}, opts);
    console.log(123,user);
		if (!user) {
			this.setData({ 
				user: null
			});
			return;
		}

		this.setData({
			user
		})
	},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: async function () {
		let isLoad = WorkBiz.isWork();
    if(isLoad){
      let res = WorkBiz.loginSilence(this)
      if(res){
        this._loadUser();
      }else{
        this.setData({
          user:null
        });
      }
    }
		wx.stopPullDownRefresh();
	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function () { },

	url: function (e) {
    if(!WorkBiz.isWork()){
      if (e.currentTarget.dataset.url=='../../meet/my_join_list/meet_my_join_list?status=use'||e.currentTarget.dataset.url=='/projects/workphoto/pages/work/meet/scan/work_meet_scan'||e.currentTarget.dataset.url=='/projects/workphoto/pages/my/fav/my_fav'||e.currentTarget.dataset.url=='/projects/workphoto/pages/news/index/news_index'||e.currentTarget.dataset.url=='../foot/my_foot'||e.currentTarget.dataset.url=='../setting/index') {
        pageHelper.showErrToast('请登录后操作',1500)
        return 
      }
    }
		pageHelper.url(e, this);
	}
})