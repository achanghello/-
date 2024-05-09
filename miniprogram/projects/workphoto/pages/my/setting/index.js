const cacheHelper = require('../../../../../helper/cache_helper.js');
const constants = require('../../../../../comm/constants');
const pageHelper = require('../../../../../helper/page_helper.js');

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
    phone:'',
    cateId:0
  },
  onLoad(){
    let user = cacheHelper.get(constants.CACHE_WORK);
    this.setData({
      phone:user.MEET_PHONE,
      cateId:user.MEET_CATE_ID
    })
  },

  url: function (e) {
		pageHelper.url(e, this);
	},
  logOut() {
    let callback = ()=>{
      cacheHelper.clear()
      wx.navigateTo({
        url: '/projects/workphoto/pages/my/index/my_index',
      })
    }

    pageHelper.showConfirm('确定要退出当前登录吗？', callback);
  },
  modifymydetail: function (e) {
    let admin = cacheHelper.get(constants.CACHE_WORK);
    if(e.currentTarget.dataset.date){
      wx.navigateTo({
        url: `/projects/workphoto/pages/admin/meet/edit/admin_meet_edit?id=${admin._id}&identify=date`,
      }) 
    }else{
      wx.navigateTo({
        url: `/projects/workphoto/pages/admin/meet/edit/admin_meet_edit?id=${admin._id}`,
      })
    }
    
  }
})