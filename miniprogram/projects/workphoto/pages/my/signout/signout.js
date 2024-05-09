const cacheHelper = require('../../../../../helper/cache_helper.js');
const constants = require('../../../../../comm/constants');
const pageHelper = require('../../../../../helper/page_helper.js');
const cloudHelper = require('../../../../../helper/cloud_helper.js');
Page({

	/**
	 * 页面的初始数据
	 */
	data: {

  },
  
  async signout(){
    let callback = async function () {
      let user = cacheHelper.get(constants.CACHE_WORK);
      let params = {
        meetId:user._id
      }
			try {
				let opts = {
					title: '注销中'
				}
				await cloudHelper.callCloudSumbit('admin/meet_del', params, opts).then(res => {
          cacheHelper.clear()
					wx.reLaunch({ url: '/projects/workphoto/pages/my/index/my_index' });
				});
			} catch (e) {
				console.log(e);
			}
		}
    pageHelper.showConfirm('确认注销账号吗?', callback);
  },

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad(options) {

	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady() {

	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow() {

	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide() {

	},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload() {

	},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh() {

	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom() {

	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage() {

	}
})