let behavior = require('../../../../../comm/behavior/news_index_bh.js');
const ProjectBiz = require('../../../biz/project_biz.js');   
const NewsBiz = require('../../../biz/news_biz.js');
const WorkBiz = require('../../../biz/work_biz.js');
const pageHelper = require('../../../../../helper/page_helper.js');

Page({

  behaviors: [behavior],
  data:{
    user:null,
    methods:{}
  },

	onLoad: function (options) {
    ProjectBiz.initPage(this); 
    this._setCate(NewsBiz.getCateList(), options, null);  
    
    let user = WorkBiz.getWorkToken()
    this.setData({
      user
    })

    this.setData({
      _params: {
        identifyId:user.MEET_CATE_ID,
        realMeetId:user._id
      }
    })

    this.setData({
      methods:(e) => {
        console.log("65456121521654541985");
        // pageHelper.url(e, this);
      }
    })
  },
  url: function (e) {
    console.log(123,e);
    // wx.navigateBack()
    pageHelper.url(e, this);
	}
})