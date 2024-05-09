const pageHelper = require('../../../../../helper/page_helper.js');
const ProjectBiz = require('../../../biz/project_biz.js');
const MeetBiz = require('../../../biz/meet_biz.js');
const FavBiz = require('../../../../../comm/biz/fav_biz.js');
const WorkBiz = require('../../../biz/work_biz.js');

Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		isLoad: false, 
		_params: null, 

		sortMenus: [],
		sortItems: []
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: async function (options) {
    // ProjectBiz.initPage(this);
    // 主页搜索带回的关键字
    if(options.search){
      this.setData({
        search:options.search
      })
    }
 
    let userId = WorkBiz.getWorkId();
		if (options && options.id) {
			this.setData({
				isLoad: true,
				_params: {
          userId,
          cateId: options.id,
				}
			});
			MeetBiz.setCateTitle();
		} else {
			this._getSearchMenu();
			this.setData({
        isLoad: true,
        _params: {
          userId,
        }
			});
		}



	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () { },

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: async function () {

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

	url: async function (e) {
		pageHelper.url(e, this);
	},

	bindCommListCmpt: function (e) {
		pageHelper.commListListener(this, e);
  },
  
  // 收藏
  bindFavTap: async function (e) {
    // await FavBiz.homeCollect(this,e.target.dataset.item._id,e.target.dataset.item.collected,'歌手预约',e.target.dataset.item.MEET_OBJ.name,e.target.dataset.index,'dataList.list')
    if(!WorkBiz.isWork()){
      pageHelper.showErrToast('请登录后操作',1500)
      return 
    }
    if(WorkBiz.getWorkId()===e.target.dataset.item._id){
      pageHelper.showErrToast('不能收藏自己',1500)
      return
    }

    await FavBiz.homeCollect(this,e.target.dataset.item._id,e.target.dataset.item.collected,e.target.dataset.item.MEET_OBJ.avatar,e.target.dataset.item.MEET_OBJ.name,e.target.dataset.item.favedCnt,e.target.dataset.item.MEET_OBJ.area,e.target.dataset.index,'dataList.list')

  },

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function () {

	},

	_getSearchMenu: function () {

		let sortItem1 = [];

		if (MeetBiz.getCateList().length > 1) { 
			sortItem1 = [{
				label: '全部',
				type: 'cateId',
				value: ''
			}];
			sortItem1 = sortItem1.concat(MeetBiz.getCateList());
		}

		let sortItems = [];
		let sortMenus = sortItem1;
		this.setData({
			sortItems,
			sortMenus
		})

	}
})