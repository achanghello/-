const pageHelper = require('../../../../../helper/page_helper.js'); 
const cloudHelper = require('../../../../../helper/cloud_helper.js');
const ProjectBiz = require('../../../biz/project_biz.js'); 
const FavBiz = require('../../../../../comm/biz/fav_biz.js');
const WorkBiz = require('../../../biz/work_biz.js');

const citySelector = requirePlugin('citySelector');
Page({
	/**
	 * 页面的初始数据
	 */
	data: { 
    bannerlist:[{
      id: '1',
      img: '../../../images/home/banner.png',
    },{
      id: '2',
      img: '../../../images/home/banner.png',
    }],
    city:'全国'
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: async function (options) {
		ProjectBiz.initPage(this);
  },
  // 显示组件
  showSelector() {
    this.setData({
      selectorVisible: true,
    });
  },

  // 当用户选择了组件中的城市之后的回调函数
  onSelectCity(e) {
    const { province, city } = e.detail;
    this.setData({
      selectedProvince: province,
      selectedCity: city,
    });
  },

	_loadList: async function () {
		let opts = {
			title: 'bar'
    }
    let userId = WorkBiz.getWorkId();

		await cloudHelper.callCloudSumbit('home/list', { city:this.data.city,userId }, opts).then(res => {
      this.setData({
				...res.data
			});
		})
  },
  
  // 收藏
  bindFavTap: async function (e) {
    if(!WorkBiz.isWork()){
        pageHelper.showErrToast('请登录后操作',1500)
        return 
    }
    if(WorkBiz.getWorkId()===e.target.dataset.item._id){
      pageHelper.showErrToast('不能收藏自己',1500)
      return
    }
    await FavBiz.homeCollect(this,e.target.dataset.item._id,e.target.dataset.item.collected,e.target.dataset.item.MEET_OBJ.avatar,e.target.dataset.item.MEET_OBJ.name,e.target.dataset.item.favedCnt,e.target.dataset.item.MEET_OBJ.area,e.target.dataset.index)
  },

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () {
   },
	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: async function () { 
    const selectedCity = citySelector.getCity(); // 选择城市后返回城市信息对象，若未选择返回null
    if(selectedCity){
      this.setData({
        city:selectedCity.name
      })
    }
    
    this._loadList();
	},

	onPullDownRefresh: async function () {
		await this._loadList();
		wx.stopPullDownRefresh();
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


	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function () {

  },
  chooseCity() {
      const key = 'LBYBZ-2KA3Z-32VXF-7CZX6-T3LQ6-VSB4M'; // 使用在腾讯位置服务申请的key
      const referer = 'achang'; // 调用插件的app的名称
      const hotCitys = '北京'; // 用户自定义的的热门城市

      wx.navigateTo({
        url: `plugin://citySelector/index?key=${key}&referer=${referer}&hotCitys=${hotCitys}`
      })
  }
})