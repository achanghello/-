const pageHelper = require('../../../../helper/page_helper.js');
const helper = require('../../../../helper/helper.js');
const cloudHelper = require('../../../../helper/cloud_helper.js');
const cacheHelper = require('../../../../helper/cache_helper.js');
const dataHelper = require('../../../../helper/data_helper.js');
const formSetHelper = require('../form_set_helper.js');
const rowsSetHelper = require('../../rows/rows_set_helper.js');
const validate = require('../../../../helper/validate.js');
const setting = require('../../../../setting/setting.js');

const citySelector = requirePlugin('citySelector');

const CACHE_FORM_SHOW_KEY = 'FORM_SHOW_CMPT';
const CACHE_FORM_SHOW_TIME = 86400 * 365;

Component({
	options: {
		addGlobalClass: true
	},

	/**
	 * 组件的属性列表
	 */
	properties: {
    fields: { // 表单字段属性{mark,val,type,must,selectOptions,desc,title}
			type: Array,
			value: [],
		},
		forms: { // 表单值
			type: Array,
			value: [], // {mark,title,val,type}
		},
		mark: { // 组件标识，用于区分缓存
			type: String,
			value: 'cmpt-form',
		}
	},

	/**
	 * 组件的初始数据
	 */
	data: {},

	/**
	 * 生命周期方法
	 */
	lifetimes: {
		ready: function () {
      console.log(this.data,'123');
			this._init();
		}
  },
  pageLifetimes: {
    show: function() {
      const selectedCity = citySelector.getCity();
      if(selectedCity&&selectedCity.name){
        this._setForm(5, selectedCity.name);
      }
    },
  },

	/**
	 * 组件的方法列表
	 */
	methods: {
		_init: function () {
      let fields = formSetHelper.initFields(this.data.fields);
      
			let newForms = [];

			for (let k = 0; k < fields.length; k++) {
				let node = {};
				node.mark = fields[k].mark;
				node.title = fields[k].title;
				node.type = fields[k].type;

				// 判断是否有表单值（依次从表单值，缓存，默认值）
        let val = this._getOneValForm(fields[k].mark, fields[k].title, fields[k].type);
        if (val === null) val = '';


        // 数据类型修正
        val = this._fixType(fields[k].type, val);
        node.val = val;
    
				fields[k].val = val;

				// rows类型
				if (node.type == 'rows') {
					//如果不足最低，则补足 
					if (!helper.isDefined(fields[k].ext.minCnt)) fields[k].ext.minCnt = 2; 
					if (val.length < fields[k].ext.minCnt) {
						let step = fields[k].ext.minCnt - val.length;
						for (let n = 1; n <= step; n++)
							val.push(dataHelper.deepClone(rowsSetHelper.BASE_ROW));
					}
					node.val = val;
					fields[k].val = val;

					// 增加一个条目数量（不用数据去渲染，仅渲染条目数量）
					fields[k].rowsCnt = val.length;
				}


				newForms.push(node);
			}


			this.setData({
				forms: newForms,
				fields,
				isLoad: true
      });
		},

		// 根据mark和type获取上次值或者缓存值或者缺省值
		_getOneValForm: function (mark, title, type) {
		 
			if (type == 'line') return title;

			let ret = null;

			// **** 对传入的默认值匹配
			let forms = this.data.forms;

			if (!forms || !Array.isArray(forms)) forms = [];
			for (let k = 0; k < forms.length; k++) {
				if (forms[k].mark == mark && forms[k].type == type) { // 优先匹配mark
					ret = forms[k].val;
					break;
				}

				if (forms[k].title == title && forms[k].type == type) { // 再则匹配名称
					ret = forms[k].val;
					break;
				}

				if (type == 'mobile' && forms[k].type == 'mobile') {
					ret = forms[k].val;
					break;
				}

				if (type == 'idcard' && forms[k].type == 'idcard') {
					ret = forms[k].val;
					break;
				}
			}
			if (ret === undefined) ret = null;

			// **** 对缓存匹配 图片和富文本和多条目不读取缓存 
			if (ret === null && this.data.isCacheMatch
				&& (type != 'image' && type != 'content' && type != 'rows')) {
				let caches = cacheHelper.get(this.data.cacheName);
				if (caches && Array.isArray(caches)) {
					for (let k = 0; k < caches.length; k++) {
						if (caches[k].mark == mark && caches[k].type == type) { // 优先匹配mark
							ret = caches[k].val;
							break;
						}

						if (caches[k].title == title && caches[k].type == type) { // 再则匹配名称
							ret = caches[k].val;
							break;
						}

						if (type == 'mobile' && caches[k].type == 'mobile') {
							ret = caches[k].val;
							break;
						}

						if (type == 'idcard' && caches[k].type == 'idcard') {
							ret = caches[k].val;
							break;
						}
					}
				}
			}
			if (ret === undefined) ret = null;

			// 缺省值匹配
			if (ret === null && this.data.isDefMatch) {
				let fields = this.data.fields;
				for (let k = 0; k < fields.length; k++) {
					if (fields[k].mark == mark
						&& helper.isDefined(fields[k].def)
						&& fields[k].def != null // 默认值为空
					) {
						ret = fields[k].def;
						break;
					}
				}
			}

			return ret;
		},

		// 原始form没有对应值, 给予默认值; 或者类型不对，修正
		_fixType: function (type, val) {

			if (type == 'line') return val;

			if (type != 'switch' && type != 'checkbox' && type != 'area' && type != 'content' && type != 'image' && type != 'vedio' && type != 'rows') {
				// switch(bool),checkbox(array), area(array), content(array) 不处理，其他做类型处理

				if (typeof val === 'object' && !Array.isArray(val)) {
					// 对象要被处理为空串，数组做trim不处理(typeof数组也是object)
					val = '';
				}
				else if (val === undefined) {
					// 当form里没有值的情况
					val = '';
				}
				else
					val = String(val).trim(); // 前后去空格
			}

			// 原始form 有对应值，但是类型不正确
			switch (type) {
				case 'image': {
					// 不支持字符串缺省值 
					if (!Array.isArray(val)) return [];
					break;
        }
        case 'vedio': {
          // 不支持字符串缺省值 
					if (!Array.isArray(val)) return [];
					break;
				}
				case 'content': {
					// 支持字符串缺省值
					if (typeof val === 'string') {
						if (val)
							return [{ type: 'text', val: val.trim() }];
						else
							return [];
					}

					if (!Array.isArray(val)) return [];
					break;
				}
				case 'rows': { // 多条目默认一条
					if (!Array.isArray(val)) return [dataHelper.deepClone(rowsSetHelper.BASE_ROW)];
					break;
				}
				// case 'area': {
				// 	if (!Array.isArray(val) || val.length != 3) return ''; //TODO?
				// 	break;
				// }
				case 'switch': {
					if (typeof (val) != 'boolean') return true;
					break;
				}
				case 'checkbox': {
					if (!Array.isArray(val)) return [String(val).trim()]; //尝试转为数组来匹配
					break;
				}
				case 'year': {
					if (!val || validate.checkYear(val)) return '';
					break;
				}
				case 'month': {
					if (!val || validate.checkYearMonth(val)) return '';
					break;
				}
				case 'date': {
					if (!val || validate.checkDate(val)) return '';
					break;
				}
				case 'hourminute': {
					if (!val || validate.checkHourMinute(val)) return '';
					break;
				}
				case 'int': { // 整数(字符形式) 
					if (!val || validate.checkInt(val)) return '';
					break;
				}
				case 'digit': { // 小数(字符形式) 
					if (!val || validate.checkDigit(val)) return '';
					break;
				}
				default: {

				}
			}

			return val;
		},

		_setForm: function (idx, val, isSetData = true) {
			let forms = this.data.forms;
			let fields = this.data.fields;
			fields[idx].val = val;
			forms[idx].val = val;

			// TODO是否需要，影响性能 
			let typeArr = ['rows', 'text', 'textarea', 'digit', 'idcard', 'int', 'tag'];

			// 去掉focus
			for (let k = 0; k < fields.length; k++) {
				if (helper.isDefined(fields[k].focus)) {
					delete fields[k].focus;
				}
			}

			// 提高性能
			let formsName = 'forms[' + idx + '].val';
			let fieldsName = 'fields[' + idx + '].val';

			// 是否渲染到页面
			if (isSetData) {
			this.setData({
				[formsName]: val,
				[fieldsName]: val,
			});
			}
			else {
				// rows的输入不渲染，但增加一个条目数量
				if (this.data.forms[idx].type == 'rows') {
					this.setData({
						['fields[' + idx + '].rowsCnt']: val.length,
					});
				}
				else {
					// 不需要在界面上set数据 eg.rows的输入不渲染
					this.data[formsName] = val;
					this.data[fieldsName] = val;
				}
			}


			//this.triggerEvent('forms', forms);
		},


    // 图片 图片s 视频
		bindImgUploadCmpt: function (e) {
			let idx = pageHelper.dataset(e, 'idx');
			let val = e.detail;
			this._setForm(idx, val);
		},

    // 输入框的实时同步值
		bindLineBlur: function (e) {
			let idx = pageHelper.dataset(e, 'idx');
			let val = e.detail.value.trim();
			this._setForm(idx, val);
    },
    // 选择框的实时同步值
    bindSelectCmpt: function (e) {
			let idx = pageHelper.dataset(e, 'idx');
			let val = e.detail.trim();
			this._setForm(idx, val);
    },
    // 日期的
    bindDayChange: function (e) {
			let idx = pageHelper.dataset(e, 'idx');
			let val = e.detail.value.trim();
			this._setForm(idx, val);
    },
    // 城市选择
    bindAreaChange: function (e) {
      const key = 'LBYBZ-2KA3Z-32VXF-7CZX6-T3LQ6-VSB4M'; // 使用在腾讯位置服务申请的key
      const referer = 'achang'; // 调用插件的app的名称
      const hotCitys = '北京'; // 用户自定义的的热门城市

      wx.navigateTo({
        url: `plugin://citySelector/index?key=${key}&referer=${referer}&hotCitys=${hotCitys}`
      })

			// let idx = pageHelper.dataset(e, 'idx');
			// let val = e.detail.value;
      // this._setForm(idx, val);
		},

		url: function (e) {
			pageHelper.url(e, this);
		},

		getForms: function (isCheckForm = false) {

      if(!this.checkForms()){
        return []
      }
			
			return this.data.forms;
    },
    
    checkForms: function () {
			let ret = formSetHelper.checkForm(this.data.fields, this.data.forms, this);

			this.setData({
				fields: this.data.fields
			});

      if (!ret) return false;

      return true
		},

		getOneFormVal(formName) {
			// 取某个表单值
			let forms = this.data.forms;
			for (let k = 0; k < forms.length; k++) {
				if (formName == forms[k].mark) {
					return forms[k].val;
				}
			}

			return null;
		},

		setOneFormVal(formName, val) {
			// 设定某个表单值
			let forms = this.data.forms;
			let fields = this.data.fields;
			for (let k = 0; k < forms.length; k++) {
				if (formName == forms[k].mark) {
					forms[k].val = val;
					fields[k].val = val;
					break;
				}
			}
			this.setData({
				fields,
				forms
			});
		}
	},

})