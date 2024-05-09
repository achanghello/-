
const pageHelper = require('../../../../../helper/page_helper.js');
const helper = require('../../../../../helper/helper.js');
const cloudHelper = require('../../../../../helper/cloud_helper.js');
const ProjectBiz = require('../../../biz/project_biz.js'); 
const PassportBiz = require('../../../../../comm/biz/passport_biz.js');
const WorkBiz = require('../../../biz/work_biz.js');
const cacheHelper = require('../../../../../helper/cache_helper.js');

Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		isLogin: true
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: async function (options) {
    let user = WorkBiz.getWorkToken();


    this.setData({
      user:user
    })
    // ProjectBiz.initPage(this);
    
		// if (!await PassportBiz.loginMustBackWin(this)) return;
		if (options && helper.isDefined(options.status)) {
      if(user.MEET_CATE_ID===1){
        this.setData({
          isLoad: true,
          _params: {
            sortType: options.status,
            sortVal: '',
            workId:WorkBiz.getWorkId()
          }
        });
      }else{
        this.setData({
          isLoad: true,
          _params: {
            sortType: options.status,
            sortVal: '',
            userId:WorkBiz.getWorkId()
          }
        });
      }
		}
		this._getSearchMenu();
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () {

	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {
    
	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide: function () {

	},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function () {

	},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: function () {

	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function () {

	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function () {

	},

	url: async function (e) {
		pageHelper.url(e, this);
	},

	bindCommListCmpt: function (e) {
		pageHelper.commListListener(this, e);
	},

	/** 搜索菜单设置 */
	_getSearchMenu: function () {
		

		let sortItems = [];

		let sortMenus = [{ label: '全部', type: 'all', value: '' }];
 

      if(this.data.user.MEET_CATE_ID===1){
        sortMenus = sortMenus.concat([
          { label: '待演出', type: 'use', value: '' },
          { label: '待确认', type: 'enter', value: '' },
          { label: '已完成', type: 'check', value: '' },
          { label: '已过期', type: 'timeout', value: '' },
        ]);
      }else{
        sortMenus = sortMenus.concat([
          { label: '待合作', type: 'use', value: '' },
          { label: '待通过', type: 'enter', value: '' },
          { label: '已完成', type: 'check', value: '' },
          { label: '已过期', type: 'timeout', value: '' },
        ]);
      }



		this.setData({
			search: '',
			sortItems,
			sortMenus,
			isLoad: true
		});

	},
	bindCancelTap: async function (e) {
		let callback = async () => {
			let joinId = pageHelper.dataset(e, 'id');
			try {
				let params = {
					joinId
				}
				let opts = {
					title: '取消中'
				}

				await cloudHelper.callCloudSumbit('meet/my_join_cancel', params, opts).then(res => {
					// pageHelper.delListNode(joinId, this.data.dataList.list, '_id');
					// this.data.dataList.total--;
					// this.setData({
					// 	dataList: this.data.dataList
          // });
          this.selectComponent("#cmpt-list").reload();
					pageHelper.showNoneToast('取消成功');
				});
			} catch (err) {
				console.log(err);
			}
		}

		pageHelper.showConfirm('确认取消该预约?', callback);
  },
  
  bindEnterTap: async function (e) {
		let callback = async () => {
      let joinId = pageHelper.dataset(e, 'id');
			try {
				let params = {
					joinId
				}
				let opts = {
					title: '确认中'
				}

        console.log(123);
        console.log(params);
				await cloudHelper.callCloudSumbit('meet/my_join_enter', params, opts).then(res => {
					// pageHelper.delListNode(joinId, this.data.dataList.list, '_id');
					// this.data.dataList.total--;
					// this.setData({
					// 	dataList: this.data.dataList
          // });
          this.selectComponent("#cmpt-list").reload();
					pageHelper.showNoneToast('确认成功');
				});
			} catch (err) {
				console.log(err);
			}
		}

		pageHelper.showConfirm('确认该预约?', callback);
  }

})