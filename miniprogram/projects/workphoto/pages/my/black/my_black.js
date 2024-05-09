const behavior = require('../../../../../comm/behavior/my_fav_bh.js');
const ProjectBiz = require('../../../biz/project_biz.js');
const WorkBiz = require('../../../biz/work_biz.js');

Page({

	behaviors: [behavior],

	data: {
    _params:{}
  },

	onReady: function () {
    let userId = WorkBiz.getWorkId();
    this.setData({
      _params:{userId}
    })
		ProjectBiz.initPage(this);
	},
})