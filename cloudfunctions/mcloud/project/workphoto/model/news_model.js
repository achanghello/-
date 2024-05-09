/**
 * Notes: 资讯实体
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2020-10-28 19:20:00 
 */


const BaseProjectModel = require('./base_project_model.js');

class NewsModel extends BaseProjectModel {

}

// 集合名
NewsModel.CL = BaseProjectModel.C('news');

NewsModel.DB_STRUCTURE = {
	_pid: 'string|true',
  NEWS_ID: 'string|true',

  JOIN_ID: 'string|true',
  JOIN_MEET_DAY: 'string|true|comment=日期',
  JOIN_IS_CHECKIN: 'int|true|default=0|comment=是否核销 0/1 ',
  JOIN_MEET_AVATAR: 'string|true|comment=头像',
  JOIN_USER_AVATAR: 'string|true|comment=头像',

  JOIN_MEET_STATUS: 'int|true|default=0|comment=状态 0=未查看,1=已查看',

  JOIN_MEET_NAME: 'string|true|comment=名字',
  JOIN_USER_NAME: 'string|true|comment=名字',
  
  JOIN_MEET_ADDRESS: 'string|true|comment=地址',

  NEWS_STATUS: 'int|true|default=0|comment=状态 0=未查看,1=已查看',

  JOIN_USER_ID: 'string|true|comment=用户ID',
  JOIN_MEET_ID: 'string|true|comment=预约PK',
  JOIN_USER_LOOK: 'int|true|default=0|comment=状态 0=未查看,1=已查看',
  JOIN_MEET_LOOK: 'int|true|default=0|comment=状态 0=未查看,1=已查看',

	NEWS_ADD_TIME: 'int|true',
	NEWS_EDIT_TIME: 'int|true',
	NEWS_ADD_IP: 'string|false',
	NEWS_EDIT_IP: 'string|false',
};

// 字段前缀
NewsModel.FIELD_PREFIX = "NEWS_";


module.exports = NewsModel;