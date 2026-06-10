# Linux 下的 LVM 基础挂载

## 适用场景

本文用于说明以下标准场景：

- 新增一块空白磁盘
- 将新磁盘加入现有卷组（VG）
- 创建新的逻辑卷（LV）
- 将逻辑卷挂载到新的目录，例如 `/data`

默认文件系统使用 `ext4`，同时提供 `xfs` 方案。动态扩容不在本文展开，另见文末相关文档。

## 一、环境现状确认

### 1.1 查看磁盘布局

先确认系统中已有卷组、挂载点和待操作的新磁盘：

```bash
lsblk -f
```

示例输出：

```text
NAME            FSTYPE      FSVER LABEL UUID                                   FSAVAIL FSUSE% MOUNTPOINTS
vda
├─vda1          vfat        FAT32       XXXX-XXXX                                 594M     1% /boot/efi
├─vda2          xfs                     xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx      800M    20% /boot
└─vda3          LVM2_member LVM2 001    xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  ├─openeuler-root
  │             xfs                     xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx     60.0G     6% /
  ├─openeuler-swap
  │             swap        1           xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx                  [SWAP]
  └─openeuler-home
                xfs                     xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx     20.0G    12% /home
vdb
```

重点确认：

- 目标磁盘例如 `vdb` 尚未挂载
- 系统中已存在可扩展的卷组，例如 `openeuler`
- 逻辑卷和根文件系统类型可通过 `lsblk -f` 直接识别

### 1.2 确认目标磁盘是空白盘

操作前确认目标磁盘没有历史分区和文件系统，避免覆盖数据：

```bash
fdisk -l /dev/vdb
blkid /dev/vdb
```

如果 `fdisk -l` 未显示分区、`blkid` 未返回文件系统信息，通常说明磁盘可继续使用。

## 二、创建 LVM 分区与卷

### 2.1 使用 fdisk 创建 LVM 分区

对新磁盘 `vdb` 创建一个整盘分区 `vdb1`：

```bash
fdisk /dev/vdb
```

交互过程如下：

```text
n
p
1


t
8e
w
```

说明：

- `n`：创建新分区
- `p`：创建主分区
- `1`：分区号使用默认值 `1`
- 起始扇区、结束扇区直接回车：使用整块磁盘空间
- `t` + `8e`：将分区类型设置为 `Linux LVM`
- `w`：写入分区表并退出

完成后验证：

```bash
lsblk /dev/vdb
```

预期结果：

```text
NAME   MAJ:MIN RM  SIZE RO TYPE MOUNTPOINTS
vdb    253:16   0  180G  0 disk
└─vdb1 253:17   0  180G  0 part
```

### 2.2 创建物理卷（PV）

将新分区初始化为物理卷：

```bash
pvcreate /dev/vdb1
```

验证：

```bash
pvdisplay /dev/vdb1
```

### 2.3 扩展现有卷组（VG）

将新物理卷加入现有卷组。以下示例卷组名为 `openeuler`：

```bash
vgextend openeuler /dev/vdb1
```

验证：

```bash
vgdisplay openeuler
```

重点关注 `Free PE / Size` 是否增加。

### 2.4 创建新的逻辑卷（LV）

使用卷组中的剩余空间创建一个名为 `data` 的逻辑卷：

```bash
lvcreate -n data -l +100%FREE openeuler
```

验证：

```bash
lvdisplay /dev/openeuler/data
```

常见设备路径如下，任选其一即可：

- `/dev/openeuler/data`
- `/dev/mapper/openeuler-data`

## 三、格式化文件系统

### 3.1 默认使用 ext4

默认方案使用 `ext4`：

```bash
mkfs.ext4 /dev/mapper/openeuler-data
```

适用场景：

- 团队无特别约束时的通用默认方案
- 希望使用更常见的 `ext4` 运维方式

### 3.2 可选使用 xfs

如果环境标准要求使用 `xfs`，改用以下命令：

```bash
mkfs.xfs -f /dev/mapper/openeuler-data
```

适用场景：

- 操作系统默认文件系统就是 `xfs`
- 团队已有统一的 `xfs` 规范

## 四、挂载逻辑卷

### 4.1 创建挂载点并临时挂载

```bash
mkdir -p /data
mount /dev/mapper/openeuler-data /data
```

验证挂载结果：

```bash
df -hT /data
```

预期结果中应看到挂载点 `/data` 和对应的文件系统类型。

### 4.2 配置开机自动挂载

编辑 `/etc/fstab`：

```bash
vim /etc/fstab
```

默认 `ext4` 写法：

```text
/dev/mapper/openeuler-data  /data  ext4  defaults  0  0
```

如使用 `xfs`，改为：

```text
/dev/mapper/openeuler-data  /data  xfs   defaults  0  0
```

字段说明：

- 第一列：逻辑卷设备路径
- 第二列：挂载点目录
- 第三列：文件系统类型
- 第四列：挂载参数，通常使用 `defaults`
- 第五列：是否参与 `dump` 备份，通常写 `0`
- 第六列：开机自检顺序，数据盘通常写 `0`

保存后执行：

```bash
mount -a
```

如果没有报错，说明 `fstab` 配置格式正确。

## 五、最终验证

### 5.1 检查块设备和挂载关系

```bash
lsblk -f
```

示例结果：

```text
NAME            FSTYPE      FSVER LABEL UUID                                   FSAVAIL FSUSE% MOUNTPOINTS
vda
├─vda1          vfat        FAT32       XXXX-XXXX                                 594M     1% /boot/efi
├─vda2          xfs                     xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx      800M    20% /boot
└─vda3          LVM2_member LVM2 001    xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  ├─openeuler-root
  │             xfs                     xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx     60.0G     6% /
  ├─openeuler-swap
  │             swap        1           xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx                  [SWAP]
  ├─openeuler-home
  │             xfs                     xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx     20.0G    12% /home
  └─openeuler-data
                ext4                    xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx    170.0G     1% /data
vdb
└─vdb1          LVM2_member LVM2 001    xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### 5.2 检查目录容量和文件系统类型

```bash
df -hT /data
```

如果这里显示 `/data` 已挂载，且类型与 `fstab` 配置一致，说明挂载成功。

## 六、注意事项

- 目标磁盘必须是空白盘；分区、格式化都会清空原有数据
- 分区类型必须设置为 `8e`，否则无法作为 `LVM` 物理卷使用
- 卷组名、逻辑卷名应以现场环境为准，不要照抄示例中的 `openeuler` 和 `data`
- `ext4` 与 `xfs` 二选一即可，`fstab` 中的类型必须与实际格式化类型一致
- 修改 `/etc/fstab` 后务必执行 `mount -a` 验证，避免重启后挂载失败

## 相关文档

- [LVM 动态扩容](/docs/devops/base/linux/lvm-extend.md)：已创建的逻辑卷需要在线扩容时使用，本文不展开
