module.exports = { //workphoto
	PROJECT_COLOR: '#000000',
	NAV_COLOR: '#ffffff',
	NAV_BG: '#000000',

	// setup
	SETUP_CONTENT_ITEMS: [
		{ title: '关于我们', key: 'SETUP_CONTENT_ABOUT' }, 
	],

	// 用户
	USER_REG_CHECK: false,
	USER_FIELDS: [
    { mark: 'bgpic', title: '主页背景图', type: 'image', min: 1, max: 1, must: true },
    { mark: 'picture', title: '头像', type: 'image', min: 1, max: 1, must: true },
		{
			mark: 'sex', title: '性别', type: 'select',
			selectOptions: [
				{ label: '男', val: '1' },
        { label: '女', val: '2' }
      ],
			def: '1', must: true
		}, 
		{ mark: 'birthday', title: '生日', type: 'date', must: true },
		{ mark: 'area', title: '地区', type: 'area', must: true },
    { mark: 'address', title: '地址', type: 'content', must: true },
    { mark: 'introduce', title: '简介', type: 'content', must: true },
    { mark: 'album', title: '照片', type: 'image', min: 1, max: 9, must: true },
		{ mark: 'vedio', title: '视频', type: 'vedio', min: 1, max: 3, must: true },
	],

	NEWS_NAME: '公告',
	NEWS_CATE: [
		{ id: 1, title: '通知公告', style: 'leftpic' }, 
	],
	NEWS_FIELDS: [

	],

	MEET_NAME: '预约',
	MEET_CATE: [
		{ id: 1, title: '摄影师预约', style: 'leftbig1' },
		{ id: 2, title: '项目预约', style: 'leftbig1' }, 
	],
	MEET_CAN_NULL_TIME: false, // 是否允许有无时段的日期保存和展示
	MEET_FIELDS: [
    { must:true, mark: 'backgroundimage', title: '主页背景图', type: 'aimage', min: 1, max: 1},
    { must:true, mark: 'avatar', title: '头像', type: 'aimage', min: 1, max: 1 },
    { must:true, mark: 'name', title: '姓名/昵称', type: 'text', min:2, max: 10 },
    {
      must:true,
			mark: 'sex', title: '性别', type: 'select',
			selectOptions: [
				{ label: '男', val: '1' },
        { label: '女', val: '2' }
      ],
			def: '1'
    },
    { must:true, mark: 'birthday', title: '生日', type: 'date' },
    { must:true, mark: 'area', title: '地区', type: 'area' },
    { must:true, mark: 'introduce', title: '艺人简介', type: 'content' },
    { must:true, mark: 'experience', title: '演艺经历', type: 'content' },
    { must:true, mark: 'photo', title: '照片', type: 'content' },
    { must:true, mark: 'video', title: '视频', type: 'content' },
    { must:true, mark: 'price', title: '参考价', type: 'select', selectOptions: ['200元/场','250元/场','300元/场','350元/场','400元/场','450元/场','500元/场','550元/场','600元/场'] }
	],
	MEET_FIELDS2: [
    { must:true, mark: 'backgroundimage', title: '主页背景图', type: 'aimage'},
    { must:true, mark: 'avatar', title: '头像', type: 'aimage'},
    { must:true, mark: 'name', title: '姓名/昵称', type: 'text', min:2, max: 10 },
    {
      must:true,
			mark: 'sex', title: '性别', type: 'select',
			selectOptions: [
				{ label: '男', val: '1' },
        { label: '女', val: '2' }
      ],
			def: '1'
    },
    { must:true, mark: 'birthday', title: '生日', type: 'date' },
    { must:true, mark: 'area', title: '地区', type: 'area' },
    { must:true, mark: 'address', title: '地址', type: 'content' },
    { must:true, mark: 'introduce', title: '简介', type: 'content' },
    { must:true, mark: 'photo', title: '照片', type: 'content' },
    { must:true, must:true, mark: 'video', title: '视频', type: 'content' },
    
	],

	MEET_JOIN_FIELDS: [
		{ mark: 'name', type: 'text', title: '姓名', must: true, min: 2, max: 30, edit: false },
    { mark: 'phone', type: 'text', len: 11, title: '手机号', must: true, edit: false },
    { mark: 'ps', type: 'textarea', max: 50, title: '备注', edit: false }
	],

	// 时间默认设置
	MEET_NEW_NODE:
	{
		mark: 'mark-no', start: '10:00', end: '10:59', limit: 1, isLimit: true, status: 1,
		stat: { succCnt: 0, cancelCnt: 0, adminCancelCnt: 0, }
	},
	MEET_NEW_NODE_DAY: [
		{
			mark: 'mark-am', start: '00:00', end: '23:59', limit: 1, isLimit: true, status: 1,
			stat: { succCnt: 0, cancelCnt: 0, adminCancelCnt: 0, }
		},
		// {
		// 	mark: 'mark-pm', start: '14:00', end: '17:59', limit: 1, isLimit: true, status: 1,
		// 	stat: { succCnt: 0, cancelCnt: 0, adminCancelCnt: 0, }
		// }
	],  

	PRODUCT_NAME: '样片',
	PRODUCT_CATE: [
		{ id: 1, title: '婚纱' },
		{ id: 2, title: '旅拍' },
		{ id: 3, title: '儿童' },
		{ id: 4, title: '写真' },
		{ id: 5, title: '萌宠' },
		{ id: 6, title: '其他' },
	],
	PRODUCT_FIELDS: [
		{ mark: 'cover', title: '封面照片', type: 'image', min: 1, max: 1, must: true },
		{ mark: 'detail', title: '详细介绍', type: 'content', must: true },
	],


}