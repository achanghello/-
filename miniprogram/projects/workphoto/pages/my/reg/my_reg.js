const pageHelper = require('../../../../../helper/page_helper.js');
const helper = require('../../../../../helper/helper.js');
const cloudHelper = require('../../../../../helper/cloud_helper.js');
const validate = require('../../../../../helper/validate.js');
const ProjectBiz = require('../../../biz/project_biz.js');
const projectSetting = require('../../../public/project_setting.js');
const setting = require('../../../../../setting/setting.js');
const PassportBiz = require('../../../../../comm/biz/passport_biz.js');

const cacheHelper = require('../../../../../helper/cache_helper.js');
const constants = require('../../../../../comm/constants');

Page({
	/**
	 * 页面的初始数据
	 */
	data: {
    agreeAndContinue: false,
    checked: false,
    phoneNumber: '',
    testCode: '',
    code: '',
    textText: '获取验证码',

    phoneNumberTip:'',
    testCodeTip:''
  },

  /**
   * 页面操作的方法
   * @param {*} phone 
   */
  
  // 校验
  checkPhone(phone){
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
    if(!this.checkPhone(this.data.formMobile)){
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
          phoneNumber:this.data.formMobile
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

   /*
   *逻辑相关的方法
   */
  // 执行一键登录
  ExeOneClickLogin () {
    if(this.data.code!=this.data.testCode){
      pageHelper.showErrToast('验证码错误',1500)
      return
    }
    let callback = async () => {
			try {
				let params = {
					phone:this.data.formMobile,
				}
				let opts = {
					title: '登录中'
				}

				await cloudHelper.callCloudSumbit('admin/meet_insert', params, opts).then(res => {
          
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
    callback();
    // 执行登录
  },
  // 一键登录
  OneClickLogin(){
    if(!this.checkPhone(this.data.formMobile)|!this.checkTestCode(this.data.testCode)){
      return
    }

    if(!this.data.checked){
      this.setData({
        agreeAndContinue: true
      })
    }else{
      this.ExeOneClickLogin()
    }
  }
})