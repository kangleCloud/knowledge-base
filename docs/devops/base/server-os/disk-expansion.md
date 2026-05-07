# LVM 磁盘扩容

## 查看挂载的磁盘

1. 查看磁盘格式

    ```shell
    lsblk
    ```
    
    结果如下：
    
    ```shell
    NAME            MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT
    sr0              11:0    1 1024M  0 rom  
    vda             252:0    0  100G  0 disk 
    ├─vda1          252:1    0    1G  0 part /boot
    └─vda2          252:2    0   99G  0 part 
      ├─centos-root 253:0    0   50G  0 lvm  /
      ├─centos-swap 253:1    0  7.9G  0 lvm  [SWAP]
      └─centos-home 253:2    0 41.1G  0 lvm  /home
    vdb
    ```

2. 查看磁盘挂载地址

    ```shell
    df -hT
    ```
    
    结果如下
    
    ```shell{6}
    文件系统                   类型      容量  已用  可用 已用% 挂载点
    devtmpfs                   devtmpfs  1.7G     0  1.7G    0% /dev
    tmpfs                      tmpfs     1.7G     0  1.7G    0% /dev/shm
    tmpfs                      tmpfs     677M   73M  604M   11% /run
    tmpfs                      tmpfs     4.0M     0  4.0M    0% /sys/fs/cgroup
    /dev/mapper/centos-root    ext4       44G  2.8G   39G    7% / // [!code focus]
    tmpfs                      tmpfs     1.7G     0  1.7G    0% /tmp
    /dev/sda2                  ext4      974M  179M  728M   20% /boot
    /dev/sda1                  vfat      599M  6.1M  593M    2% /boot/efi
    /dev/sdb1                  xfs       500G  211G  290G   43% /data
    ```


## 初始化空闲磁盘

```shell
pvcreate /dev/sbd
```

结果如下：

```shell
Physical volume "/dev/sdb" successfully created
```

## 显示物理卷

```shell
pvidisplay /dev/sba
```

结果如下：

```shell
"/dev/sdb" is a new physical volume of "100.00 GiB"
--- NEW Physical volume ---
PV Name               /dev/sdb
VG Name
PV Size               100.00 GiB
Allocatable           NO
PE Size               0
Total PE              0
Free PE               0
Allocated PE          0
PV UUID               69d9dd18-36be-4631-9ebb-78f05fe3217f
```

## 查看卷组

```shell
vgdisplay
```

输出结果如下：

```shell{2}
  --- Volume group ---
  VG Name               centos        # 这里的虚拟卷组命名为 centos // [!code focus]
  System ID             
  Format                lvm2
  Metadata Areas        1
  Metadata Sequence No  3
  VG Access             read/write
  VG Status             resizable
  MAX LV                0
  Cur LV                2
  Open LV               2
  Max PV                0
  Cur PV                1
  Act PV                1
  VG Size               48.41 GiB
  PE Size               4.00 MiB
  Total PE              12393
  Alloc PE / Size       12393 / 48.41 GiB
  Free  PE / Size       0 / 0   
  VG UUID               W11wWS-8UYJ-lLaJ-UOLm-6aKn-9ViM-Ysch8t
```

## 拓展卷

1. 将新增的磁盘挂载在卷组下

    ```shell
    vgextend centos /dev/sbd
    ```

2. 拓展逻辑卷

    ```shell
    lvextend -l +100%FREE /dev/mapper/centos-root
    ```

3. 调整文件系统，拓展逻辑卷内空间，对于不同的文件系统，执行下面的命令：

    ::: code-group
    
    ```shell [ext3/ext4]
    resize2fs /dev/mapper/centos-root
    ```
    
    ```shell [xfs]
    xfs_growfs /dev/mapper/centos-root
    ```
    
    :::

## 参考资料

- https://zhuanlan.zhihu.com/p/261035292
