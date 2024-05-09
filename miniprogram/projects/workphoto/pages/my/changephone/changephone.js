const cacheHelper = require('../../../../../helper/cache_helper.js');
const constants = require('../../../../../comm/constants');
const pageHelper = require('../../../../../helper/page_helper.js');
const cloudHelper = require('../../../../../helper/cloud_helper.js');

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
    phone:'',

    newphone:'',
    testCode: '',
    code: '',
    textText: '获取验证码',
  },
  onLoad(){
    let user = cacheHelper.get(constants.CACHE_WORK);
    this.setData({
      phone:user.MEET_PHONE
    })
  },

  // 校验
  checkPhone(phone){
    console.log("phone",phone);
    let reg_phone = /^(\+)?(0|86|17951)?1(3\d|4[579]|5\d|6\d|7\d|8\d|9\d)\d{8}$/;
    if (reg_phone.test(phone)) {
      this.setData({
        phoneNumberTip:''
      })
      return true;
    } else {
      this.setData({
        phoneNumberTip:'请输入正确的手机号！'
      })
      return false;
    }
  },
  checkTestCode(code){
    let reg=/^\d{4}$/;
    if(reg.test(code)){
      this.setData({
        testCodeTip:''
      })
      return true;
    } else {
      this.setData({
        testCodeTip:'请输入四位数字验证码'
      })
      return false;
    }
  },

  // 开始计时
  startClock(){
    if(!this.checkPhone(this.data.newphone)){
      pageHelper.showErrToast('手机号格式不正确')
      return
    }

    if(this.data.textText!=='获取验证码'){
      return
    }
    // 获取验证码
    wx.cloud.callFunction({
      name: 'mcloud',
      data: {
        route: "passport/gettestcode",
        token: "",
        PID: "workphoto",
        params: {
          phoneNumber:this.data.newphone
        }
      },
      success: (res)=> {
        console.log(res);
        this.setData({
          code:res.result.data.code
        })
      },
      fail: function (err) {
        console.log(err);
      }
    });
    let timenumber = 60;
    let clock = setInterval(()=>{
      this.setData({
        textText:timenumber+'秒'
      })
      timenumber--;
      if(timenumber<0){
        this.setData({
          textText:'获取验证码'
        })
        clearInterval(clock)
      }
    },1000)
  },

  async changePhone(){
    console.log(this.data.testCode);
    if(this.data.testCode===''){
      pageHelper.showErrToast('验证码为空',1500)
      return
    }
    console.log(this.data.code,this.data.testCode);
    if(this.data.code!=this.data.testCode){
      pageHelper.showErrToast('验证码错误',1500)
      return
    }
    let { _id } = cacheHelper.get(constants.CACHE_WORK);
    if(_id){
      let opts = {
        title: '手机号变更...'
      }
      let data = { id:_id,phone:this.data.newphone }
      await cloudHelper.callCloudSumbit('admin/meet_edit', data,opts);
      pageHelper.showSuccToast('变更成功');
      wx.navigateTo({
        url: '/projects/workphoto/pages/my/index/my_index',
      })
    }  
  }
})