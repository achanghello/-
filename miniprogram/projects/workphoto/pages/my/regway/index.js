const pageHelper = require('../../../../../helper/page_helper.js');
const cloudHelper = require('../../../../../helper/cloud_helper.js')
const helper = require('../../../../../helper/helper.js');

const cacheHelper = require('../../../../../helper/cache_helper.js');
const constants = require('../../../../../comm/constants');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    agreeAndContinue: false,
    checked: false,
  },
  /*
   *页面相关的方法
   */
  // 弹窗
  checkboxChange(e){
    if(e.detail.value.length===0){
      this.setData({
        checked: false
      })
    }else{
      this.setData({
        checked: true
      })
    }
  },
  // 关闭弹窗
  close(){
    this.setData({
      agreeAndContinue: false
    })
  },
  // 跳转路由
  jump(){
    wx.navigateTo({
      url: `/projects/workphoto/pages/my/reg/my_reg`,
    })
  },
   /*
   *逻辑相关的方法
   */
  // 执行一键登录
  ExeOneClickLogin (e) {
    let callback = async () => {
			let cloudID = e.detail.cloudID
			try {
				let params = {
					cloudID
				}
				let opts = {
					title: '登录中'
				}

				await cloudHelper.callCloudSumbit('admin/meet_oneclicklogin', params, opts).then(res => {
          console.log(res);
					let result = res;
          if (result && helper.isDefined(result.data.MEET_TOKEN) && result.data.MEET_TOKEN) {
            cacheHelper.set(constants.CACHE_WORK, result.data, constants.WORK_TOKEN_EXPIRE);
  
            let callback = () => {
              wx.navigateTo({
                url: '../identify/identify'
              })
            }
            if(result.data.MEET_CATE_ID!==0){
              callback = () => {
                wx.reLaunch({ url: '/projects/workphoto/pages/default/index/default_index' });
              }
            }
  
            pageHelper.showSuccToast('登录成功', 1500, callback);
          }
				});
			} catch (err) {
				console.log(err);
			}
		}
    // 执行一键登录
    if(e.detail.cloudID){
      callback();
    }
    
  },
  // 一键登录
  OneClickLogin(e){
    if(!this.data.checked){
      this.setData({
        agreeAndContinue: true
      })
    }else{
      this.ExeOneClickLogin(e)
    }
  },
})