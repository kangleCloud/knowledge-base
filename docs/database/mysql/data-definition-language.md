 # DDL 常用示例

 数据库模式定义语言DDL(Data Definition Language)，是用于描述数据库中要存储的现实世界实体的语言。

 常用公共字段

| 字段名 | 类型 | 默认值 | 字段说明 |
| -- | -- | -- | -- |
| state         | tinyint(1) | 0 | 状态标识 |
| parent_id     | int(10)    | 0 | 父级编号 |
| seq           | int(10)    | 0 | 排序（行记录的自增量值） |
| is_top        | tinyint(1) | 0 | 是否已置顶 |
| is_released   | tinyint(1) | 0 | 是否已发布：0=未发布；1=已发布 |
| released_flag | tinyint(1) | 0 | 发布标识：0=未发布；1=已发布；2=定时发布 |
| released_at   | int(10)    | 0 | 发布时间（Unix时间戳） |
| expired_at    | int(10)    | 0 | 过期时间（Unix时间戳） |
| is_deleted    | tinyint(1) | 0 | 是否已删除：0=未删除；1=已删除 |
| deleted_flag  | tinyint(1) | 0 | 删除标识：0=未删除；1=已删除；2=回收站 |
| deleted_at    | int(10)    | 0 | 删除时间（Unix时间戳） |
| updated_at    | int(10)    | 0 | 更新时间（Unix时间戳） |
| created_at    | int(10)    | 0 | 创建时间（Unix时间戳） |


 ## 用户中心
用户信息表
```sql
CREATE TABLE `user_profile` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '用户唯一Id',
  `mobile` varchar(11) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '手机号 唯一',
  `nickname` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '昵称',
  `avatar_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '头像',
  `birthday` date DEFAULT NULL COMMENT '生日',
  `real_name` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '真实姓名',
  `id_type` tinyint NOT NULL DEFAULT '1' COMMENT '证件类型，1-身份证，2-护照，3-港澳通行证，4-港澳台居住证，5-外国人永久居住证',
  `id_card` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '身份证号 唯一',
  `gender` tinyint unsigned NOT NULL DEFAULT '0' COMMENT '性别，1=男，2=女',
  `password` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '密码(明文md5加盐)',
  `secret_key` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '密钥',
  `salt_key` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '盐',
  `level` tinyint unsigned NOT NULL DEFAULT '0' COMMENT '0是未实名1是实名2是实人实名',
  `is_disabled` tinyint unsigned NOT NULL DEFAULT '0' COMMENT '是否禁用',
  `invite_code` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '邀请码',
  `from_invite_code` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '被邀请的邀请码',
  `register_device_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '注册设备device id',
  `register_ip` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '注册ip',
  `register_at` int unsigned NOT NULL DEFAULT '0' COMMENT '注册时间',
  `last_login_at` int unsigned NOT NULL DEFAULT '0' COMMENT '记录更新时间',
  `certified_at` int unsigned NOT NULL DEFAULT '0' COMMENT '认证时间',
  `code_use_type` tinyint(1) DEFAULT '1' COMMENT '邀请码使用行为  1新注册  2修改资料',
  `ip_region` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '' COMMENT 'ip归属地 省份+城市 ，分割 省份前 城市后',
  `priority` tinyint DEFAULT '0' COMMENT '优先级 0-10 10最大',
  `source` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '注册来源和渠道',
  `disabled_at` int unsigned NOT NULL DEFAULT '0' COMMENT '黑名单禁用时间，根据时间判断是否拉黑',
  `created_at` int unsigned NOT NULL DEFAULT '0' COMMENT '记录创建时间',
  `updated_at` int unsigned NOT NULL DEFAULT '0' COMMENT '记录更新时间',
  `is_column_disabled` tinyint(1) NOT NULL DEFAULT '0' COMMENT '用户是否有栏目被禁言 0否 1是',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `idx_idcard` (`id_card`) USING BTREE,
  KEY `idx_nickname` (`nickname`) USING BTREE,
  KEY `idx_mobile` (`mobile`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=1000000 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=COMPACT COMMENT='用户信息表';
```

注销用户表
```sql
CREATE TABLE `delete_user_profile` (
  `id` int unsigned NOT NULL AUTO_INCREMENT COMMENT 'Id',
  `user_id` bigint unsigned NOT NULL COMMENT '用户唯一Id',
  `cancel_ip` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '注销ip',
  `cancel_region` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '注销地区 省市',
  `cancel_user_device_id` int NOT NULL DEFAULT '0' COMMENT '注销用户设备记录id,关联user_device的id',
  `mobile` varchar(11) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '手机号 唯一',
  `nickname` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '昵称',
  `avatar_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '头像',
  `birthday` date DEFAULT NULL COMMENT '生日',
  `real_name` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '真实姓名',
  `id_type` tinyint NOT NULL DEFAULT '1' COMMENT '证件类型，1-身份证，2-护照，3-港澳通行证，4-港澳台居住证，5-外国人永久居住证',
  `id_card` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '身份证号 唯一',
  `gender` tinyint unsigned NOT NULL DEFAULT '0' COMMENT '性别，1=男，2=女',
  `password` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '密码(明文md5加盐)',
  `secret_key` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '密钥',
  `salt_key` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '盐',
  `level` tinyint unsigned NOT NULL DEFAULT '0' COMMENT '0是未实名1是实名2是实人实名',
  `is_disabled` tinyint unsigned NOT NULL DEFAULT '0' COMMENT '是否禁用',
  `invite_code` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '邀请码',
  `from_invite_code` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '被邀请的邀请码',
  `register_device_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '注册设备device id',
  `register_ip` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '注册ip',
  `register_at` int unsigned NOT NULL DEFAULT '0' COMMENT '注册时间',
  `last_login_at` int unsigned NOT NULL DEFAULT '0' COMMENT '记录更新时间',
  `certified_at` int unsigned NOT NULL DEFAULT '0' COMMENT '认证时间',
  `source` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '注册来源和渠道',
  `disabled_at` int unsigned NOT NULL DEFAULT '0' COMMENT '黑名单禁用时间，根据时间判断是否拉黑',
  `deleted_at` int unsigned NOT NULL DEFAULT '0' COMMENT '删除时间',
  `created_at` int unsigned NOT NULL DEFAULT '0' COMMENT '记录创建时间',
  `updated_at` int unsigned NOT NULL DEFAULT '0' COMMENT '记录更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `idx_mobile` (`mobile`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=COMPACT COMMENT='注销用户信息表';
```

用户通行证表
```sql
CREATE TABLE `user_passport` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '自增Id',
  `user_id` bigint unsigned NOT NULL DEFAULT '0' COMMENT '用户唯一Id',
  `passport_type` int unsigned NOT NULL DEFAULT '0' COMMENT '通行证类型1=手机号 2密码 3微信 4苹果',
  `passport_name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '通行证名字（对应type下唯一）',
  `is_deleted` tinyint unsigned NOT NULL DEFAULT '0',
  `created_at` int unsigned NOT NULL DEFAULT '0' COMMENT '记录创建时间',
  `updated_at` int unsigned NOT NULL DEFAULT '0' COMMENT '记录更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `idx_passport` (`passport_name`,`passport_type`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=COMPACT COMMENT='用户通信证';
```

用户设备表
```sql
CREATE TABLE `user_device` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL DEFAULT '0' COMMENT '用户id',
  `device` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '手机型号',
  `device_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '设备id',
  `platform` tinyint unsigned NOT NULL DEFAULT '0' COMMENT '2=IOS，1=Andriod',
  `system_version` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '系统版本',
  `app_version` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT 'app版本',
  `push_channel` tinyint unsigned NOT NULL DEFAULT '0' COMMENT '推送通道，1极光 2腾讯 3百度 4友盟 5个推',
  `push_channel_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '推送通道标识',
  `created_at` int unsigned NOT NULL DEFAULT '0' COMMENT '创建时间',
  `updated_at` int unsigned NOT NULL DEFAULT '0' COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `idx_user_id` (`user_id`) USING BTREE,
  KEY `idx_device_id` (`device_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC COMMENT='用户设备表';
```

用户邀请码
```sql
CREATE TABLE `user_invite_code` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '邀请码',
  `type` tinyint unsigned NOT NULL DEFAULT '0' COMMENT '1=用户邀请码，2=后台创建',
  `remark` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '备注',
  `invite_count` int unsigned NOT NULL DEFAULT '0' COMMENT '邀请用户数',
  `is_deleted` tinyint unsigned NOT NULL DEFAULT '0' COMMENT '是否删除，0=否，1=是',
  `created_at` int unsigned NOT NULL DEFAULT '0' COMMENT '创建时间',
  `updated_at` int unsigned NOT NULL DEFAULT '0' COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uniq_code` (`code`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC COMMENT='邀请码主表';
```

用户邀请记录表
```sql
CREATE TABLE `invite_user_log` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL COMMENT '用户id',
  `invite_code` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '邀请码',
  `invited_user_id` bigint unsigned NOT NULL COMMENT '被邀请人用户id',
  `mobile` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '被邀请人手机号',
  `created_at` int unsigned NOT NULL DEFAULT '0' COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uniq_invite_code` (`invite_code`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC COMMENT='邀请用户记录表';
```




 ## 支付中心

 ## 消息中心

 ## 卡券系统

 ## 资讯系统

栏目
 ```sql
 CREATE TABLE `news_category` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `parent_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '父级编号',
  `name` varchar(140) NOT NULL DEFAULT '' COMMENT '频道名',
  `is_deleted` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '删除标识',
  `updated_at` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '更新时间',
  `created_at` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '创建时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COMMENT='资讯 - 栏目';

 ```

 稿件
 ```sql
 CREATE TABLE `news_article` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `cate_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '栏目编号',
  `title` varchar(64) NOT NULL DEFAULT '' COMMENT '资讯列表标题',
  `show_style` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '列表展现形式：1=无图；2=单图；3=多图；4=宽图；5=大图',
  `cover` varchar(125) NOT NULL DEFAULT '' COMMENT '封面缩略图URL地址',
  `long_title` varchar(128) NOT NULL DEFAULT '' COMMENT '资讯正文标题',
  `summary` varchar(255) NOT NULL DEFAULT '' COMMENT '资讯概要',
  `source` varchar(32) NOT NULL DEFAULT '' COMMENT '来源',
  `is_external_link` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '是否为外链',
  `external_link` varchar(255) NOT NULL DEFAULT '' COMMENT '外链URL地址',
  `view_count` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '浏览数',
  `incr_view_count` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '增加浏览数',
  `top` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '置顶标识（头条、次头条场景）',
  `seq` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '排序',
  `version` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '版本号',
  `release_flag` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '发布标识：0=未发布；1=已发布；2=定时发布',
  `released_at` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '发布时间',
  `delete_flag` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '删除标识：0=未删除；1=草稿箱；2=已删除',
  `updated_at` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '更新时间',
  `created_at` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COMMENT='资讯 - 稿件';
 ```

 稿件正文
 ```sql
 CREATE TABLE `news_content` (
  `id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '稿件编号',
  `content` longtext COMMENT '稿件正文',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='资讯 - 稿件正文';
 ```

评论
 ```sql
 CREATE TABLE `news_comment` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `article_id` int(10) unsigned NOT NULL COMMENT '稿件编号',
  `parent_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '父级评论编号',
  `uid` int(10) unsigned NOT NULL COMMENT '用户编号',
  `nickname` varchar(256) NOT NULL DEFAULT '' COMMENT '用户昵称',
  `content` varchar(256) NOT NULL DEFAULT '' COMMENT '评论内容',
  `liked_count` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '点赞个数',
  `unliked_count` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '点踩个数',
  `created_at` int(10) unsigned NOT NULL COMMENT '发布时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='资讯 - 评论';
 ```

收藏
 ```sql
 CREATE TABLE `news_favorite` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `uid` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '用户编号',
  `article_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '稿件编号',
  `created_at` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='资讯 - 收藏';
 ```

 ## 广告系统
广告位
```sql
CREATE TABLE `ad_pos` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `pos_code` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '广告位编号',
  `pos_name` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '广告位名称',
  `parent_pos_code` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '父级编号',
  `tpe` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '1=图 2=文字 3=图文 4=视频',
  `show_ct` int(10) unsigned NOT NULL DEFAULT '1' COMMENT '显示数量',
  `ext_json` varchar(1024) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '扩展字段',
  `ios_min_client_version` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT 'ios最低客户端版本',
  `ios_max_client_version` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT 'ios最高客户端版本',
  `android_min_client_version` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT 'android最低客户端版本',
  `android_max_client_version` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT 'android最高客户端版本',
  `pos_width` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '图片宽度',
  `pos_height` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '图片高度',
  `is_show_title` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '0=不显示标题 1=显示标题',
  `created_user` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '创建人',
  `updated_user` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '最后修改人',
  `deleted_user` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '删除人',
  `is_deleted` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '1=已删除 0=未删除',
  `deleted_at` int(10) unsigned NOT NULL DEFAULT '0',
  `updated_at` int(10) unsigned NOT NULL DEFAULT '0',
  `created_at` int(10) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='广告位';

```

广告
```sql
CREATE TABLE `ad` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `ad_pos_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '广告位置编号',
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '广告名称',
  `brief` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '广告描述',
  `seq` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '排序值',
  `image` varchar(1024) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '图片信息',
  `url` varchar(1024) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '广告链接',
  `platform` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '1=ios 2=android 3=ios&android',
  `ios_min_client_version` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '最低客户端版本',
  `ios_max_client_version` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '最高客户端版本',
  `android_min_client_version` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT 'android最低客户端版本',
  `android_max_client_version` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT 'android最高客户端版本',
  `is_show_title` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '0=不显示标题 1=显示标题',
  `next_show_time` bigint(20) unsigned NOT NULL DEFAULT '0' COMMENT '弹层下次开始时间',
  `start_time` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '开始时间 时间戳',
  `end_time` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '结束时间 时间戳',
  `state` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '1=上架 0=下架',
  `is_whitelist` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '1=启用白名单 0=未启用',
  `created_user` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '创建人',
  `updated_user` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '最后修改人',
  `deleted_user` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '删除人',
  `is_deleted` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '0=未删除 1=已删除',
  `deleted_at` int(10) unsigned NOT NULL DEFAULT '0',
  `updated_at` int(10) unsigned NOT NULL DEFAULT '0',
  `created_at` int(10) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='广告';

```

广告白名单
```sql
CREATE TABLE `ad_whitelist` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `ad_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '广告编号',
  `mobile` char(11) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '手机号',
  `is_deleted` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `deleted_at` int(10) unsigned NOT NULL DEFAULT '0',
  `created_at` int(10) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='广告 - 白名单';
```

 ## 应用分发
应用区块表
```sql
CREATE TABLE `app_block` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `pid` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '父级编号',
  `top_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '顶层编号',
  `block_name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '模块名称',
  `desc` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '介绍',
  `seq` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '排序值',
  `icon` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '图标',
  `state` tinyint(1) unsigned NOT NULL DEFAULT '1' COMMENT '1=显示 2=隐藏',
  `readonly` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '0=可编辑 1=不可编辑(只读)',
  `block_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '' COMMENT '区块url',
  `deletable` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '0=不可删除 1=可删除',
  `created_user` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '创建人',
  `updated_user` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '最后修改人',
  `deleted_user` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '删除人',
  `is_deleted` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '0=未删除 1=已删除',
  `deleted_at` int(10) unsigned NOT NULL DEFAULT '0',
  `updated_at` int(10) unsigned NOT NULL DEFAULT '0',
  `created_at` int(10) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='应用 - 区块';
```

应用信息表
```sql
CREATE TABLE `app_info` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `app_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '应用编号',
  `name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '应用名称',
  `brief` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '描述',
  `icon` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '应用图标',
  `dispatch` varchar(1024) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '应用地址',
  `platform` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '支持平台 1=ios 2=android 3=ios&android',
  `is_show_header` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '头部 0=不显示原生 1=显示原生',
  `tag` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '标签 逗号,隔开',
  `state` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '1显示2隐藏 （暂时废弃）',
  `sort` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '排序',
  `organization_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '所属主体机构',
  `is_third_url` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '是否为外链 0=平台应用 1=是',
  `is_authorization` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '是否要授权 1=是 0=否',
  `is_certification` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '是否需要实名认证 1=是 0=否',
  `is_deleted` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '0=未删除 1=已删除',
  `search_doc_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '搜索文档id',
  `search_doc_message` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '',
  `app_type` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '应用类型 1平台应用 2网页 3小程序 4外部APP',
  `mini_appid` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '小程序appid',
  `mini_path` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '小程序页面地址',
  `is_whitelist` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '是否需要白名单 1=是 0=否',
  `created_user` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '创建人',
  `updated_user` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '最后修改人',
  `deleted_user` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '删除人',
  `deleted_at` int(10) unsigned NOT NULL DEFAULT '0',
  `updated_at` int(10) unsigned NOT NULL DEFAULT '0',
  `created_at` int(10) unsigned NOT NULL DEFAULT '0',
  `is_hint` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '1提示0不提示红点',
  `hint_end_time` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '红点结束时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `app_id` (`app_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='应用 - 信息';
```

应用主体机构
```sql
CREATE TABLE `app_info_organization` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `client_id` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '',
  `client_secret` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '',
  `name` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '机构名称',
  `icon` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT 'icon',
  `brief` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '描述',
  `mobile` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '联系电话',
  `is_default_user_info` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '用户默认信息 1=是 0=否',
  `is_certification_info` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '实名信息 1=是 0=否',
  `grant_type` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '授权模式 1=配置授权项 2=静默授权',
  `is_deleted` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `created_user` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '',
  `updated_user` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '',
  `deleted_user` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '',
  `deleted_at` int(10) unsigned NOT NULL DEFAULT '0',
  `updated_at` int(10) unsigned NOT NULL DEFAULT '0',
  `created_at` int(10) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='应用白名单表';
```

应用白名单表
```sql
CREATE TABLE `app_info_whitelist` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `app_info_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '对应所属应用',
  `mobile` char(11) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '手机号',
  `is_deleted` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `deleted_at` int(10) unsigned NOT NULL DEFAULT '0',
  `created_at` int(10) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC COMMENT='应用白名单表';
```


客户端应用表(上架应用)
```sql
CREATE TABLE `client_app` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `block_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '所属区块编号',
  `app_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '应用编号',
  `app_name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '应用名称',
  `app_icon` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '应用图标',
  `app_desc` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '描述',
  `ios_min_client_version` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT 'ios最大客户端版本',
  `ios_max_client_version` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT 'ios最低客户端版本',
  `android_min_client_version` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT 'android最低客户端版本',
  `android_max_client_version` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT 'android最高客户端版本',
  `app_extra` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '应用协议额外参数',
  `seq` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '排序值',
  `is_top` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '置顶 0=否 1=是',
  `state` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '1=上架 2=下架',
  `app_type` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '应用类型 1平台应用 2网页 3小程序 4外部APP',
  `is_hint` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '1提示0不提示红点',
  `hint_end_time` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '红点结束时间',
  `is_whitelist` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '1=启用白名单 0=不启用',
  `platform` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '支持平台 1=ios 2=android 3=ios&android',
  `created_user` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '创建人',
  `updated_user` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '最后修改人',
  `deleted_user` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '删除人',
  `is_deleted` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '1=已删除 0=未删除',
  `deleted_at` int(10) unsigned NOT NULL DEFAULT '0',
  `updated_at` int(10) unsigned NOT NULL DEFAULT '0',
  `created_at` int(10) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `block_id` (`block_id`,`app_id`,`state`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='客户端 - 应用';
```

我的应用表
```sql
CREATE TABLE `user_app_info` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT '自增id',
  `user_id` bigint(20) NOT NULL DEFAULT '0' COMMENT '用户id',
  `appinfos` text COLLATE utf8mb4_general_ci COMMENT '我的应用信息，应用ID多个用逗号分隔',
  `updated_at` int(10) unsigned NOT NULL DEFAULT '0',
  `created_at` int(10) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='我的应用表';
```