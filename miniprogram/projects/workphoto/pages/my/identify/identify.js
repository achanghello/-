const cacheHelper = require('../../../../../helper/cache_helper.js');
const constants = require('../../../../../comm/constants');
const WorkBiz = require('../../../biz/work_biz.js');
const cloudHelper = require('../../../../../helper/cloud_helper');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    chooseitems:[
      {
        pic:'../../../images/my/chooseidentify/singernochoose.png',
        picchoose:'../../../images/my/chooseidentify/singerchoose.png',
        chinese:'我是歌手',
        english:'I Am a Singer'
      },
      {
        pic:'../../../images/my/chooseidentify/commercialnochoose.png',
        picchoose:'../../../images/my/chooseidentify/commercialchoose.png',
        chinese:'我是商户',
        english:'I am a merchant'
      }
    ],
    
    choose:2
  },

  /**
   * 页面操作的方法
   */
  chooseClick(e){
    if(this.data.choose===e.currentTarget.dataset.number){
      this.setData({
        choose:2
      })
      return
    }
    this.setData({
      choose:e.currentTarget.dataset.number
    })
  },
  chooseComplete() {
    let cateId,cateName;
    if(this.data.choose===0){
      cateId=1;
      cateName='歌手';
    }else if(this.data.choose===1){
      cateId=2;
      cateName='商户';
    }
    let id = WorkBiz.getWorkId();

    let data = {
      cateId,cateName,
      id
    }
    cloudHelper.callCloudSumbit('admin/meet_edit', data).then(()=>{
      wx.reLaunch({ url: '/projects/workphoto/pages/default/index/default_index' });
    })
  }
})