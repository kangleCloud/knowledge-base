# Linux下系统磁盘挂载（LVM 方式）

## 1.环境现状确认

### 0x01.查看磁盘布局

执行以下命令确认当前磁盘状态，确保 vdb 为未分区的空白磁盘：

```bash
lsblk
```

当前现状输出：

```md
NAME            MAJ:MIN RM   SIZE RO TYPE MOUNTPOINT
sr0              11:0    1   458K  0 rom  
vda             253:0    0   120G  0 disk
├─vda1          253:1    0   600M  0 part /boot/efi
├─vda2          253:2    0     1G  0 part /boot
└─vda3          253:3    0 118.4G  0 part
  ├─klas-root   252:0    0    77G  0 lvm  /
  ├─klas-swap   252:1    0   3.9G  0 lvm  [SWAP]
  └─klas-backup 252:2    0  37.6G  0 lvm  
vdb             253:16   0   180G  0 disk  # 目标空白磁盘
```

### 0x02.确认磁盘无文件系统

检查 vdb 是否存在已有分区或文件系统，避免数据覆盖：

```bash
fdisk -l /dev/vdb
blkid /dev/vdb
```
   
以下结果无分区信息：

```md
Disk /dev/vdb: 180 GiB, 193273528320 bytes, 377487360 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
 ```

以下结果/dev/vdb1有分区信息：

```md
Disk /dev/vdb: 180 GiB, 193273528320 bytes, 377487360 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: dos
Disk identifier: 0x7a0a5bbc

Device     Boot Start       End   Sectors  Size Id Type
/dev/vdb1        2048 377487359 377485312  180G 8e Linux LVM
```

若 fdisk -l 输出无分区信息、blkid 无文件系统标识，说明磁盘干净，可继续操作。


## 2.操作步骤

### 0x01.创建磁盘分区（MBR 格式）

 对 vdb 进行分区（整盘划分为一个分区 vdb1）

```bash
fdisk /dev/vdb
```

执行以下交互操作（输入对应命令后按回车）：

```bash
输入 n：创建新分区

输入 p：选择主分区（默认）

分区号：直接回车（默认 1）

起始扇区：直接回车（默认从第一个扇区开始）

结束扇区：直接回车（默认使用整个磁盘空间）

输入 t：修改分区类型

输入 8e：将分区类型改为 LVM 专用类型（Linux LVM）

输入 w：保存分区表并退出
```

```bash
fdisk /dev/vdb

Welcome to fdisk (util-linux 2.35.2).
Changes will remain in memory only, until you decide to write them.
Be careful before using the write command.

Device does not contain a recognized partition table.
Created a new DOS disklabel with disk identifier 0x4c9d278b.

Command (m for help): n
Partition type
p   primary (0 primary, 0 extended, 4 free)
e   extended (container for logical partitions)
Select (default p): p
Partition number (1-4, default 1): 1
First sector (2048-377487359, default 2048):
Last sector, +/-sectors or +/-size{K,M,G,T,P} (2048-377487359, default 377487359):

Created a new partition 1 of type 'Linux' and of size 180 GiB.

Command (m for help): t
Selected partition 1
Hex code (type L to list all codes): 8e
Changed type of partition 'Linux' to 'Linux LVM'.

Command (m for help): w
The partition table has been altered.
Calling ioctl() to re-read partition table.
Syncing disks.
```

验证分区结果：

 ```bash
 lsblk /dev/vdb
 ```

预期输出（出现 vdb1 分区）：

```md
NAME   MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT
vdb    253:16   0  180G  0 disk
└─vdb1 253:17   0  180G  0 part
```

### 0x02.创建物理卷（PV）

将分区 vdb1 初始化为 LVM 物理卷：

 ```bash
 pvcreate /dev/vdb1
 ```

成功输出：

```md
Physical volume "/dev/vdb1" successfully created.
```

验证 PV：

```bash
pvdisplay /dev/vdb1
```

关键信息确认：

```md
"/dev/vdb1" is a new physical volume of "<180.00 GiB"
--- NEW Physical volume ---
PV Name               /dev/vdb1
VG Name               
PV Size               <180.00 GiB
Allocatable           NO
PE Size               0   
Total PE              0
Free PE               0
Allocated PE          0
PV UUID               rtqQri-YzFO-dSHm-FeNh-2Kk6-DvGe-Gtt1HI
```

### 0x03.扩展现有卷组（VG）

系统已存在卷组 klas（由 vda3 组成），将新 PV vdb1 加入该卷组，扩容存储池：

```bash
vgextend klas /dev/vdb1
```

成功输出：

```md
Volume group "klas" successfully extended
```

验证 VG 扩容结果：

```bash
vgdisplay klas
```

关键信息确认（Free PE/Size 增加 180G）：

```md
--- Volume group ---
VG Name               klas
System ID             
Format                lvm2
Metadata Areas        2
Metadata Sequence No  5
VG Access             read/write
VG Status             resizable
MAX LV                0
Cur LV                3
Open LV               2
Max PV                0
Cur PV                2
Act PV                2
VG Size               <298.41 GiB # 原 root+swap+backup 占用
PE Size               4.00 MiB
Total PE              76392
Alloc PE / Size       30313 / 118.41 GiB  # 原 root+swap+backup 占用
Free  PE / Size       46079 / <180.00 GiB # 新增可用空间（含原剩余）
VG UUID               sVJTy2-IE2j-RHee-ORC2-xv3P-E2r7-YSiDuP
```

### 0x04.创建逻辑卷（LV）

创建逻辑卷（使用卷组所有剩余空间，名称为 klas-data）

```bash
lvcreate -n data -l +100%FREE klas
```

成功输出：

```md
Logical volume "data" created.
```

验证 LV 创建结果：

```bash
lvdisplay /dev/mapper/klas-data
```

关键信息确认：

```md
--- Logical volume ---
LV Path                /dev/klas/klas-data
LV Name                klas-data
VG Name                klas
LV UUID                8oeWDh-azpW-TrfU-o0nR-ug5c-tZVz-j3SNJv
LV Write Access        read/write
LV Creation host, time DG-2280-172381603, 2025-12-05 15:35:25 +0800
LV Status              available
# open                 0
LV Size                <180.00 GiB
Current LE             46079
Segments               1
Allocation             inherit
Read ahead sectors     auto
- currently set to     8192
Block device           252:3
```

### 0x05.格式化逻辑卷

确定逻辑卷格式化类型:

```bash
df -T / | grep -v Filesystem
```

:::tip
- 输出含 ext4 → 逻辑卷格式化为 ext4；

- 输出含 xfs → 逻辑卷格式化为 xfs。
:::

预期输出：

```md
/dev/mapper/klas-root xfs   80659988 4593020  76066968   6% /
```

这里将 klas-data 格式化为 xfs 文件系统：

```bash
mkfs.xfs -f /dev/mapper/klas-data
```

成功输出（关键信息）

```md
meta-data=/dev/mapper/klas-data  isize=512    agcount=4, agsize=11796224 blks
         =                       sectsz=512   attr=2, projid32bit=1
         =                       crc=1        finobt=1, sparse=1, rmapbt=0
         =                       reflink=1
data     =                       bsize=4096   blocks=47184896, imaxpct=25
         =                       sunit=0      swidth=0 blks
naming   =version 2              bsize=4096   ascii-ci=0, ftype=1
log      =internal log           bsize=4096   blocks=23039, version=2
         =                       sectsz=512   sunit=0 blks, lazy-count=1
realtime =none                   extsz=4096   blocks=0, rtextents=0
```

### 0x06.创建挂载点并挂载

创建 /data 挂载点

```bash
mkdir -p /data
```

临时挂载（立即生效，重启失效）

```bash
mount /dev/mapper/klas-data /data
```

验证临时挂载

```bash
df -h /data
```

预期输出：

```md
Filesystem             Size  Used Avail Use% Mounted on
/dev/mapper/klas-data  180G  1.3G  179G   1% /data
```

永久挂载（修改 /etc/fstab）

编辑 /etc/fstab 文件，添加挂载配置，确保重启后自动挂载：

```bash
vim /etc/fstab
```

在文件末尾添加以下一行

```md
/dev/mapper/klas-data  /data  xfs  defaults  0  0
```

:::tip
- /dev/mapper/klas-data：逻辑卷设备路径

- /data：挂载点目录

- xfs：文件系统类型

- defaults：挂载参数（默认权限，含读写、自动挂载等）

- 0：是否备份（0 = 不备份）

- 0：是否开机自检（0 = 不自检）
:::

验证永久挂载配置

```bash
# 测试 fstab 配置是否正确（无报错则正常）
mount -a

# 再次查看挂载状态
lsblk
```

## 3.最终验证

执行 lsblk 命令，确认输出与目标状态一致：

```bash
lsblk
```

目标输出：

```md
NAME            MAJ:MIN RM   SIZE RO TYPE MOUNTPOINT
sr0              11:0    1   458K  0 rom  
vda             253:0    0   120G  0 disk 
├─vda1          253:1    0   600M  0 part /boot/efi
├─vda2          253:2    0     1G  0 part /boot
└─vda3          253:3    0 118.4G  0 part 
  ├─klas-root   252:0    0    77G  0 lvm  /
  ├─klas-swap   252:1    0   3.9G  0 lvm  [SWAP]
  └─klas-backup 252:2    0  37.6G  0 lvm  
vdb             253:16   0   180G  0 disk 
└─vdb1          253:17   0   180G  0 part 
  └─klas-data   252:3    0   180G  0 lvm  /data
```

注意事项
:::warning
数据安全：操作前确保 vdb 无重要数据，分区和格式化会清空磁盘内容；

分区类型：必须将 vdb1 类型改为 8e（LVM），否则无法加入卷组；

fstab 配置：编辑 /etc/fstab 时需确保路径和文件系统类型正确，错误配置可能导致系统无法开机；
:::

## 附录1

### 0x01.参考资料

- https://zhuanlan.zhihu.com/p/721866479
