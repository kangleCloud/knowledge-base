# kkFileView安装

## 一、上传服务器部署运行
1. 从[版本发布记录](https://file.kkview.cn/record)或[官方部署指南](https://kkview.cn/zh-cn/docs/production.html)下载对应发行包，并上传到部署目录

2. 解压: tar -zxvf kkFileView-4.4.0-SNAPSHOT.tar.gz

3. 配置文件在kkFileView-4.4.0-SNAPSHOT/config/application.properties
:::warning
注意: 每次解压, config会被覆盖, 记得提前备份
:::

4. 进入解压后文件夹kkFileView-4.4.0-SNAPSHOT/bin

5. 启动 ./startup.sh

6. 默认首页地址如下 http://{ip地址}:8012
![](/images/middleware/kkfileview/install-3.png)

## 二、更新重启
1. 进入部署目录中的bin目录

2. 先执行./shutdown.sh

3. 更新jar包

4. 再执行./startup.sh 即可

## 三、配置白名单
在部署目录中的config目录中,修改application.properties文件中的 trust.host 参数
:::warning
#信任站点，多个用','隔开，设置了之后，会限制只能预览来自信任站点列表的文件，默认不限制
trust.host = 180.117.162.13,cdnfile-s3.gususerv.com
:::


## 三、调用方式
```javascript
varurl = 'https://cdnfile-s3.gususerv.com/public/2024/07/10/f69b4e1c-8f4e-48bc-a8af-8dad9a926920.doc'; //要预览文件的访问地址 
window.open('http://127.0.0.1:8012/onlinePreview?url='+encodeURIComponent(Base64.encode(url)));
```

## 参考资料
- [官网地址](https://kkfileview.keking.cn/zh-cn/index.html)
- [码云- gitee](https://gitee.com/kekingcn/file-online-preview)
- [部署指南](https://kkview.cn/zh-cn/docs/production.html)




