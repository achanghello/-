const cloudHelper = require('../../../../../helper/cloud_helper.js');
const pageHelper = require('../../../../../helper/page_helper.js');
const timeHelper = require('../../../../../helper/time_helper.js')
const MeetBiz = require('../../../biz/meet_biz.js');
const projectSetting = require('../../../public/project_setting.js');
const ProjectBiz = require('../../../biz/project_biz.js');
const PassportBiz = require('../../../../../comm/biz/passport_biz.js');
const BlackBiz = require('../../../../../comm/biz/black_biz');
const WorkBiz = require('../../../biz/work_biz.js');

Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		isLoad: false,


		tabCur: 0,
		mainCur: 0,
		verticalNavTop: 0,

		cur: 'detail',

		dayIdx: 0,
    timeIdx: -1,
    
    date: new Date().getFullYear(),
    isSelf: true,

    showIndex:null,//打开弹窗的对应下标
    isBlack: 0,

    isShop: 0,
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {

		ProjectBiz.initPage(this);

		if (!pageHelper.getOptions(this, options)) return;

    this._loadDetail();
    BlackBiz.isBlack(this, this.data.id);
	},

	_loadDetail: async function () {
		this.setData({
			dayIdx: 0,
			timeIdx: -1,
			isLoad: false
		});

		let id = this.data.id;
		if (!id) return;

		let params = {
			id,
		};
		let opt = {
			title: 'bar'
		};
		let meet = await cloudHelper.callCloudData('meet/view', params, opt);
    
    if (!meet) {
			this.setData({
				isLoad: false
      })
      pageHelper.showNoneToast('该用户不存在');
      setTimeout(()=>{
        wx.navigateBack()
      },1500)
			return;
		}

		let days = meet.MEET_DAYS_SET;

		let dayNow1 = timeHelper.time('Y-M-D');
		let dayNow2 = timeHelper.time('Y-M-D', 86400);
		let dayNow3 = timeHelper.time('Y-M-D', 86400 * 2);

		for (let k = 0; k < days.length; k++) {

			if (days[k].day == dayNow1) days[k].status = '今天';
			if (days[k].day == dayNow2) days[k].status = '明天';
			if (days[k].day == dayNow3) days[k].status = '后天';

			days[k].week = timeHelper.week(days[k].day);
			days[k].date = days[k].day.split('-')[1] + '-' + days[k].day.split('-')[2]
		}


		this.setData({
			isLoad: true,
			meet,
			days,
			canNullTime: projectSetting.MEET_CAN_NULL_TIME
		});

  },
  
  computedAge(birthday){
    return birthday
  },

	bindDayTap: function (e) {
		let dayIdx = pageHelper.dataset(e, 'idx');
		this.setData({
			dayIdx,
			timeIdx: -1,
		});
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
    let user = WorkBiz.getWorkToken()
    if(!user){
      return
    }
    if(user.MEET_CATE_ID){
      this.setData({
        isShop:user.MEET_CATE_ID
      })
    }
    if(WorkBiz.getWorkId()===this.data.id){
      this.setData({
        isSelf:false,
      })
    }
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
	onPullDownRefresh: async function () {
		await this._loadDetail();
		wx.stopPullDownRefresh();
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
		return {
			title: this.data.meet.MEET_TITLE,
			imageUrl: this.data.meet.MEET_OBJ.cover[0]
		}
	},

	bindTimeTap: function (e) {
		let timeIdx = pageHelper.dataset(e, 'timeidx');

		let node = this.data.days[this.data.dayIdx].times[timeIdx];
		if (node.error) return;

		this.setData({
			timeIdx
		});
	},

	bindJoinTap: async function (e) {
		// if (!await PassportBiz.loginMustCancelWin(this)) return;

		this.setData({
			cur: 'time'
		});

		let dayIdx = this.data.dayIdx;
		let timeIdx = this.data.timeIdx;
		if (timeIdx < 0) return pageHelper.showNoneToast('请先选择预约时段');

		let time = this.data.meet.MEET_DAYS_SET[dayIdx].times[timeIdx];


		if (time.error) {
			if (time.error.includes('预约'))
				return pageHelper.showModal('该时段' + time.error + '，换一个时段试试吧！');
			else
				return pageHelper.showModal('该时段预约' + time.error + '，换一个时段试试吧！');
		}

		let meetId = this.data.id;
		let timeMark = time.mark;

		let callback = async () => {
			try {
				let opts = {
					title: '请稍候',
        }
        let userId = WorkBiz.getWorkId()

        if(!userId){
          return
        }
        
				let params = {
          userId,
					meetId,
					timeMark
				}
				await cloudHelper.callCloudSumbit('meet/before_join', params, opts).then(res => {
          let user = WorkBiz.getWorkToken();
          if(!user){
            pageHelper.showErrToast('请登录后操作',1500)
            return
          }
          if(!user.MEET_OBJ.address){
            pageHelper.showErrToast('请设置地址后操作',1500)
            return
          }
					wx.navigateTo({
						url: `../join/meet_join?id=${meetId}&timeMark=${timeMark}`,
					})
				});
			} catch (ex) {
				console.log(ex);
			}
		}
		callback();

  },
  
  preview(e){
    wx.previewImage({
      current:e.currentTarget.dataset.url,
      urls:this.data.meet.MEET_OBJ.photo.map(item=>item.val)
    })
  },

	url: function (e) {
		pageHelper.url(e, this);
	},

	bindTabTap: function (e) {
		let cur = pageHelper.dataset(e, 'cur');
		this.setData({
			cur
		});
	},

	onPageScroll: function (e) {
		if (e.scrollTop > 100) {
			this.setData({
				topBtnShow: true
			});
		} else {
			this.setData({
				topBtnShow: false
			});
		}
	},

 
  // 弹窗
  openPopup(e){
    this.setData({
      showIndex:2
    })
  },
  async joinBlack(){
    await BlackBiz.updateBlack(this, this.data.id, this.data.isBlack, this.data.meet.MEET_OBJ.avatar, this.data.meet.MEET_OBJ.name,this.data.meet.MEET_OBJ.area);
  },
  //关闭弹窗
  closePopup(){
    this.setData({
      showIndex:null
    })
  },
  goHome(){
    wx.reLaunch({
      url: '/projects/workphoto/pages/default/index/default_index',
    })
  }
})