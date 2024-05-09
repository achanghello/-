/**
 * Notes: 产品后台管理
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2022-06-08 07:48:00 
 */

const BaseProjectAdminService = require('./base_project_admin_service.js');
const AdminHomeService = require('../admin/admin_home_service.js');
const dataUtil = require('../../../../framework/utils/data_util.js');
const util = require('../../../../framework/utils/util.js');
const cloudUtil = require('../../../../framework/cloud/cloud_util.js');
const timeUtil = require('../../../../framework/utils/time_util.js');
const ProductModel = require('../../model/product_model.js');

class AdminProductService extends BaseProjectAdminService {

	/** 推荐首页SETUP */
	async vouchProductSetup(id, vouch) {
		if (vouch == 0) {
			let adminHomeService = new AdminHomeService();
			await adminHomeService.delHomeVouch(id);
		}
		else if (vouch == 1) {
			let product = await ProductModel.getOne(id);
			if (!product) return;

			if (product.PRODUCT_VOUCH != 1) return;

			let adminHomeService = new AdminHomeService();
			await adminHomeService.updateHomeVouch({
				type: 'product',
				ext: product.PRODUCT_CATE_NAME,
				title: product.PRODUCT_TITLE,
				id,
				desc: product.PRODUCT_OBJ.adv,
				pic: product.PRODUCT_OBJ.cover,
				cateId: product.PRODUCT_CATE_ID
			});

		}
	}

	/**添加 */
	async insertProduct({
		title,
		cateId,
		cateName,
		order,
		forms
	}) {


		// 重复性判断
		let where = {
			PRODUCT_TITLE: title,
			PRODUCT_CATE_ID: cateId
		}
		if (await ProductModel.count(where))
			this.AppError('该标题已经存在');

		// 赋值 
		let data = {};
		data.PRODUCT_TITLE = title;
		data.PRODUCT_CATE_ID = cateId;
		data.PRODUCT_CATE_NAME = cateName;
		data.PRODUCT_ORDER = order;

		data.PRODUCT_OBJ = dataUtil.dbForms2Obj(forms);
		data.PRODUCT_FORMS = forms;


		let id = await ProductModel.insert(data);

		let qr = await this.genDetailQr('product', id);
		ProductModel.edit(id, { PRODUCT_QR: qr });

		return {
			id
		};
	}

	/**删除数据 */
	async delProduct(id) {
		let where = {
			_id: id
		}

		// 异步处理 新旧文件
		let product = await ProductModel.getOne(id, 'PRODUCT_FORMS,PRODUCT_QR');
		if (!product) return;
		cloudUtil.handlerCloudFilesForForms(product.PRODUCT_FORMS, []);
		cloudUtil.deleteFiles(product.PRODUCT_QR);

		await ProductModel.del(where);

		this.vouchProductSetup(id, 0);

	}

	/**获取信息 */
	async getProductDetail(id) {
		let fields = '*';

		let where = {
			_id: id
		}
		let product = await ProductModel.getOne(where, fields);
		if (!product) return null;

		return product;
	}

	// 更新forms信息
	async updateProductForms({
		id,
		hasImageForms
	}) {
		await ProductModel.editForms(id, 'PRODUCT_FORMS', 'PRODUCT_OBJ', hasImageForms);

		this.vouchProductSetup(id, 1);
	}


	/**更新数据 */
	async editProduct({
		id,
		title,
		cateId, // 二级分类 
		cateName,
		order,
		forms,
	}) {

		// 重复性判断
		let where = {
			PRODUCT_TITLE: title,
			PRODUCT_CATE_ID: cateId,
			_id: ['<>', id]
		}
		if (await ProductModel.count(where))
			this.AppError('该标题已经存在');


		// 异步处理 新旧文件
		let oldForms = await ProductModel.getOneField(id, 'PRODUCT_FORMS');
		if (!oldForms) return;
		cloudUtil.handlerCloudFilesForForms(oldForms, forms);

		// 赋值 
		let data = {};
		data.PRODUCT_TITLE = title;
		data.PRODUCT_CATE_ID = cateId;
		data.PRODUCT_CATE_NAME = cateName;
		data.PRODUCT_ORDER = order;

		data.PRODUCT_OBJ = dataUtil.dbForms2Obj(forms);
		data.PRODUCT_FORMS = forms;


		await ProductModel.edit(id, data);

		// 小程序码
		let qr = await this.genDetailQr('product', id);
		ProductModel.edit(id, { PRODUCT_QR: qr });

		this.vouchProductSetup(id, 1);
	}

	/**取得分页列表 */
	async getAdminProductList({
		search, // 搜索条件
		sortType, // 搜索菜单
		sortVal, // 搜索菜单
		orderBy, // 排序
		whereEx, //附加查询条件
		page,
		size,
		isTotal = true,
		oldTotal
	}) {

		orderBy = orderBy || {
			'PRODUCT_ORDER': 'asc',
			'PRODUCT_ADD_TIME': 'desc'
		};
		let fields = 'PRODUCT_TITLE,PRODUCT_CATE_ID,PRODUCT_CATE_NAME,PRODUCT_EDIT_TIME,PRODUCT_ADD_TIME,PRODUCT_ORDER,PRODUCT_STATUS,PRODUCT_VOUCH,,PRODUCT_QR,PRODUCT_OBJ';

		let where = {};
		where.and = {
			_pid: this.getProjectId() //复杂的查询在此处标注PID
		};

		if (util.isDefined(search) && search) {
			where.or = [
				{ PRODUCT_TITLE: ['like', search] },
			];

		} else if (sortType && util.isDefined(sortVal)) {
			// 搜索菜单
			switch (sortType) {
				case 'cateId': {
					where.and.PRODUCT_CATE_ID = String(sortVal);
					break;
				}
				case 'status': {
					where.and.PRODUCT_STATUS = Number(sortVal);
					break
				}
				case 'vouch': {
					where.and.PRODUCT_VOUCH = 1;
					break;
				}
				case 'top': {
					where.and.PRODUCT_ORDER = 0;
					break;
				}
				case 'sort': {
					orderBy = this.fmtOrderBySort(sortVal, 'PRODUCT_ADD_TIME');
					break;
				}
			}
		}

		return await ProductModel.getList(where, fields, orderBy, page, size, isTotal, oldTotal);
	}

	/**修改状态 */
	async statusProduct(id, status) {
		let data = {
			PRODUCT_STATUS: status
		}
		let where = {
			_id: id,
		}
		return await ProductModel.edit(where, data);
	}

	/**置顶与排序设定 */
	async sortProduct(id, sort) {
		sort = Number(sort);
		let data = {};
		data.PRODUCT_ORDER = sort;
		await ProductModel.edit(id, data);

	}

	/**首页设定 */
	async vouchProduct(id, vouch) {
		vouch = Number(vouch);
		let data = {};
		data.PRODUCT_VOUCH = vouch;
		await ProductModel.edit(id, data);


		this.vouchProductSetup(id, vouch);
	}
}

module.exports = AdminProductService;