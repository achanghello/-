const AdminBiz = require('../../../../../../comm/biz/admin_biz.js');
const pageHelper = require('../../../../../../helper/page_helper.js');
const PublicBiz = require('../../../../../../comm/biz/public_biz.js');
const cloudHelper = require('../../../../../../helper/cloud_helper.js');
const timeHelper = require('../../../../../../helper/time_helper.js');
const validate = require('../../../../../../helper/validate.js');
const AdminMeetBiz = require('../../../../biz/admin_meet_biz.js');
const projectSetting = require('../../../../public/project_setting.js');
const WorkBiz = require('../../../../biz/work_biz.js');

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		isLoad: false
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: async function (options) {
		if (!pageHelper.getOptions(this, options)) return;
    
		if(options.identify){
      this.setData({
        identify:options.identify
      })
      this.setData(await AdminMeetBiz.initFormData(options.identify)); // 初始化表单数据
    }else{
      let cateId = WorkBiz.getWorkCateId();
      if(cateId===1){
        this.setData(await AdminMeetBiz.initFormData('singer')); // 初始化表单数据
      }else if(cateId===2){
        this.setData(await AdminMeetBiz.initFormData('merchent')); // 初始化表单数据
      }
    }
    await this._loadDetail();
  },
	_loadDetail: async function () {
		let id = this.data.id;
		if (!id) return;

		let params = {
			id
		};
		let opt = {
			title: '加载中'
		};
		let meet = await cloudHelper.callCloudData('admin/meet_detail', params, opt);

		if (!meet) {
			this.setData({
				isLoad: false
			})
			return;
		}

		if(this.data.identify==='date'){
			this.setData({
				isLoad: true,

				// 表单数据   
				formCancelSet: meet.MEET_CANCEL_SET,
        formDaysSet: meet.MEET_DAYS_SET,
        formArea: meet.MEET_AREA
			});
		}else{
			this.setData({
				isLoad: true,

				// 表单数据   
				formForms: meet.MEET_FORMS
			});
		}
	},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: async function () {
		await this._loadDetail();
		wx.stopPullDownRefresh();
	},


	bindFormEditSubmit: async function () {
		pageHelper.formClearFocus(this);

		let data = this.data;
    data = validate.check(data, AdminMeetBiz.CHECK_FORM, this);

		if (!data) return;


		if(this.data.identify!=='date'){
      let forms = this.selectComponent("#cmpt-form").getForms(true);
      let cateId = WorkBiz.getWorkCateId();
      if((cateId===1||cateId===2)&&forms.length===0){
        return
      }
			if (forms){
				data.forms = forms;
        data.status = 1;
      }
		}
    
    	
		try {
			let meetId = this.data.id;
			data.id = meetId;
			// 先修改，再上传 
      await cloudHelper.callCloudSumbit('admin/meet_edit', data);
      
      wx.navigateBack();

		} catch (err) {
			console.log(err);
		}

	},



	url: function (e) {
		pageHelper.url(e, this);
  },
  bindAreaChange: function (e) {
    let val = e.detail.value;
    this.setData({
      formArea: val
    })
  },
})