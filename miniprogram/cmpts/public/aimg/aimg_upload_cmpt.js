const pageHelper = require('../../../helper/page_helper.js');
const contentCheckHelper = require('../../../helper/content_check_helper.js');
const setting = require('../../../setting/setting.js');
const cloudHelper = require('../../../helper/cloud_helper.js');
const cacheHelper = require('../../../helper/cache_helper.js');
const constants = require('../../../comm/constants');

Component({
	/**
	 * 组件的属性列表
	 */
	properties: {
		imgList: {
			type: String,
			value: ''
		},
		title: {
			type: String,
			value: '图片上传',
		},
		must: { //是否必填
			type: Boolean,
			value: true,
		},
		isCheck: { //是否做图片内容校验
			type: Boolean,
			value: true,
		},
		imgUploadSize: { //图片最大大小
			type: Number,
			value: setting.IMG_UPLOAD_SIZE,
    },
    shape: { //图片最大大小
			type: String,
			value: 'rectangle',
		},
	},

	/**
	 * 组件的初始数据
	 */
	data: {
    timestamp:''
		//imgList:[]
	},


	/**
	 * 生命周期方法
	 */
	lifetimes: {
		attached: function () {

		},

		ready: function () {
      this.setData({
        timestamp:new Date().getTime()
      })
		},
		detached: function () {
			// 在组件实例被从页面节点树移除时执行
		},
	},

	/**
	 * 组件的方法列表
	 */
	methods: {
		/**
		 * 选择上传图片 
		 */
		bindChooseImgTap: function (e) {
			wx.chooseMedia({
				count: 1, //默认9
				mediaType: ['image'],
				sizeType: ['compressed'], //可以指定是原图还是压缩图，默认二者都有
				sourceType: ['album', 'camera'], //从相册选择
				success: async (res) => {

          // 截取的长和宽
          let cropScale = "1:1";
          if(this.data.shape==='rectangle'){
            cropScale = "4:3"
          }

          wx.showLoading({
            title: '图片校验中',
            mask: true
          });
          
          let size = res.tempFiles[0].size;
          let path = res.tempFiles[0].tempFilePath;
          if (!contentCheckHelper.imgTypeCheck(path)) {
            wx.hideLoading();
            return pageHelper.showNoneToast('只能上传png、jpg、jpeg格式', 3000);
          }
    
          let imageMaxSize = 1024 * 1000 * this.data.imgUploadSize;
          if (!contentCheckHelper.imgSizeCheck(size, imageMaxSize)) {
            wx.hideLoading();
            return pageHelper.showNoneToast('单张图片大小不能超过 ' + this.data.imgUploadSize + 'M', 3000);
          }
    
          if (this.data.isCheck) {
            let check = await contentCheckHelper.imgCheck(path);
            if (!check) {
              wx.hideLoading();
              return pageHelper.showNoneToast('存在不合适的图片, 已屏蔽', 3000);
            }
          }


          wx.cropImage({
            cropScale: cropScale,
            src: path,
            success:async(res) => {
              console.log("图片校验中...",res);
              let user = cacheHelper.get(constants.CACHE_WORK);
              let ext = res.tempFilePath.match(/\.[^.]+?$/)[0];
              wx.cloud.uploadFile({
                cloudPath: 'workphoto/meet/'+user._id+'/'+this.data.title+ext,
                filePath: res.tempFilePath, // 文件路径
                success: async res => {
                  let result = await cloudHelper.getTempFileURLOne(res.fileID)
                  // 重新加载图片
                  this.setData({
                    timestamp: new Date().getTime()
                  })
  
                  this.triggerEvent('upload', result);
                  wx.hideLoading();
                },
                fail: err => {
                  // handle error
                }
              })
            }
          })
				}
			});
		}
	}
})