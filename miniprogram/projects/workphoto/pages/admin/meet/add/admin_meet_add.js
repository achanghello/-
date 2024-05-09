const AdminBiz = require('../../../../../../comm/biz/admin_biz.js');
const pageHelper = require('../../../../../../helper/page_helper.js');

const cacheHelper = require('../../../../../../helper/cache_helper.js');
const constants = require('../../../../../../comm/constants');

const PublicBiz = require('../../../../../../comm/biz/public_biz.js');
const cloudHelper = require('../../../../../../helper/cloud_helper.js');
const validate = require('../../../../../../helper/validate.js');
const AdminMeetBiz = require('../../../../biz/admin_meet_biz.js');
const projectSetting = require('../../../../public/project_setting.js');
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		isLoad: true,

	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: async function (options) {
		this.setData(await AdminMeetBiz.initFormData()); // 初始化表单数据   
	},

	bindJoinFormsCmpt: function (e) {
		this.setData({
			formJoinForms: e.detail,
		});
	},

	bindFormAddSubmit: async function () {
    // 清楚下面的红字提示
		pageHelper.formClearFocus(this);

		let data = this.data;

		data = validate.check(data, AdminMeetBiz.CHECK_FORM, this);
		if (!data) return;

		try {
      // 先创建，再上传 
      console.log("data",data);
			let res = await cloudHelper.callCloudSumbit('admin/meet_insert', data);
      // let meetId = result.data.id;
      if (res && res.data)
					cacheHelper.set(constants.CACHE_WORK, res.data, constants.WORK_TOKEN_EXPIRE);

      wx.reLaunch({
        url: pageHelper.fmtURLByPID('/pages/my/index/my_index'),
      });

			// let callback = async function () {
      //   wx.navigateTo({
      //     url: 'projects/workphoto/pages/my/index/my_index',
      //   })
			// }
			// pageHelper.showSuccToast('添加成功', 2000, callback);

		} catch (err) {
			console.log(err);
		}

	},

	url: function (e) {
		pageHelper.url(e, this);
	},


	bindCateIdSelect: function (e) {
		this.setData({
			formCateId: e.detail,
		});
		if (e.detail != 1) {
			this.setData({
				formPhone: '',
				formPassword: ''
			});
		}
	}


})