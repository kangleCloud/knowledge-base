# Python环境管理工具 Conda

## 一、Conda安装
:::tip
- 所有源码包下载到 /usr/local/src 中
- 软件安装到 /usr/local 中，并以软件名及主次版本号命名，如 conda3
:::

### 0x01.下载Anaconda安装程序
[Anaconda](https://www.anaconda.com/download/success)
```bash
cd /usr/local/src
wget -c https://repo.anaconda.com/archive/Anaconda3-2024.10-1-Linux-x86_64.sh
```

### 0x02.执行安装程序
执行下载好的安装程序：Anaconda3-2024.02-1-Linux-x86_64.sh，由于版本不同，执行命令中的文件名会不一样，根据实际的文件名修改以下命令即可。
```bash
bash Anaconda3-2024.10-1-Linux-x86_64.sh
```

执行以上命令后，按"ENTER"键，进入安装流程，首先会显示授权协议信息，如果不想看可以按 "ctrl+c" 退出。  
查看完授权协议信息后，需要输入yes接受授权协议才可以继续安装。  
接受授权协议安装后，默认安装当前用户目录下面，也可以修改成自己的目录  
比如：：/usr/local/conda3

### 0x03.初始化Conda
```bash
#进入安装目录下执行
cd /usr/local/conda3
./bin/conda init
```

### 0x04.配置环境变量
```bash
# 添加搜索路径到配置文件
echo 'PATH=$PATH:/user/local/conda3/bin
export PATH' >> /etc/profile

# 刷新环境变量
source /etc/profile
```

Ubuntu配置环境变量
```bash
# 添加搜索路径到配置文件
echo 'PATH=$PATH:/user/local/conda3/bin
export PATH' >> ~/.bashrc

# 刷新环境变量
source ~/.bashrc
```


### 0x05.配置镜像源
查看已有镜像源
```bash
conda config --show channels
```

配置清华大学镜像源
```bash
conda config --add channels  https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/main
conda config --add channels  https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/free
conda config --add channels  https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/r
conda config --add channels  https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/pro
conda config --add channels  https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/msys2
```

删除镜像
```bash
conda config --remove channels https://xxxxxxxxxxxxxxx
```

## 二、Conda常用命令

### 0x01.环境管理命令
查看所有环境
```bash
conda info --env
# 或者
conda env list
```

创建新环境
```bash
# 创建一个名为env_name的Python环境，并指定Python版本
conda create -n env_name python=3.10
```

激活环境
```bash
conda activate env_name
```

退出环境
```bash
# 退出当前激活的Conda环境
conda deactivate
```

克隆环境
```bash
conda create -n new_env_name --clone old_env_name
```

删除环境
```bash
conda remove --name env_name --all
```

### 0x02.包管理命令
查看所有包
```bash
# 显示Conda所有包，如果是在激活的环境下则显示当前环境的所有包
conda list
```

安装新包
```bash
conda install package_name
```

更新包
```bash
conda update package_name
```

搜索包
```bash
# Conda仓库中搜索指定的包
conda search package_name
```

卸载包
```bash
# 卸载package_name包
conda remove package_name
```

### 0x03.配置相关命令
查看配置信息
```bash
# 查看配置信息
conda config --show
# 查看某个配置项的值
conda config --show 配置项
```

设置配置项
```bash
conda config --set 配置项=配置值
```

重置配置项
```bash
# 重置指定配置项的值为默认值
conda config --remove-key 配置项
```

### 0x04.其他常用命令
查看Conda版本
```bash
conda --version
# 或者
conda -V
```

升级Conda
```bash
conda update conda
```

卸载Anaconda
```bash
# 1.直接删除安装目录
rm  -rf  /user/local/conda3
# 2.撤消对shell初始化脚本的更改
conda init --reverse --all
# 3.删除可能已在主目录中创建的以下隐藏文件和文件夹
rm -rf ~/.condarc ~/.conda ~/.continuum
```

配置自动激活状态
```bash
# 关闭自动激活状态
conda config --set auto_activate_base false
# 开启自动激活状态
conda config --set auto_activate_base true
```

## 三、参考资料
- https://docs.anaconda.com/anaconda/install/
- https://blog.csdn.net/m0_37559973/article/details/138085180
- https://blog.csdn.net/lewis2951/article/details/136640530