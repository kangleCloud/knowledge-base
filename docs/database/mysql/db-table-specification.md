# 库表规约

> 大部分内容摘录自阿里巴巴 Java 开发手册

数据库名、表名、字段名命名中禁止使用 MySQL 关键字和保留字。

临时库表必须以 tmp_ 或 temp_ 为前缀，并以日期为后缀，例如：tmp_file_20230101。

备份库表必须以 bak_ 或 backup_ 为前缀，并以日期为后缀，例如：bak_saas_admincenter_20230101。

:::danger
MySQL 在 Windows 下不区分大小写，但在 Linux 下默认是区分大小写。因此数据库名、表名、字段名都不允许出现任何大写字母，避免节外生枝。
:::

## 一、数据库命名

库名必须使用英文小写字母或数字，加上下划线 `_` 组成；例如：xxx_basic，xxx_user，xxx_app。

库名与应用名称尽量一致，要能做到见名识意，并且最好不要超过32个字符。

## 二、库表命名

表名、字段名必须使用小写字母或数字，多个单词的场景可以加上下划线 `_`，<font color="red">禁止出现数字开头，禁止两个下划线中间只出现数字</font>。

<font color="green">【正例】</font>：aliyun_admin，rdc_config，level3_name <br />
<font color="red">【反例】</font>：AliyunAdmin，rdcConfig，level_3_name

:::tip
- 表名不使用复数名词，表名应该仅仅表示表里面的实体内容，不应该表示实体数量，对应于 DO 类名也是单数形式，符合表达习惯。
- 表的命名最好是遵循“业务名称_表的作用”，例如：alipay_task / force_project / trade_config / tes_question
:::

## 三、表字段命名

<font color="canary"> <b>总是使用单数形式；总是使用小写字母，除非是特殊情况，如专有名词；避免列名和表名同名。</b> </font>

同数据库表命名，表达是与否概念的字段，必须使用 is_xxx 的方式命名，数据类型是 unsigned tinyint（1 表示是，0 表示否）。

<font color="canary">【注意】</font>：数据库表示是与否的值，使用 tinyint 类型，坚持 is_xxx 的命名方式是为了明确其取值含义与取值范围。<br />
<font color="green">【正例】</font>：表达逻辑删除的字段名 is_deleted，1 表示删除，0 表示未删除。

:::tip
- 表字段名的修改代价很大，因为无法进行预发布，所以字段名称需要慎重考虑。
:::

## 四、表字段约定

- 禁用保留字，如 desc、range、match、delayed、name、type 等，请参考 MySQL 官方保留字。
- 任何字段如果为非负数，必须是 unsigned。
- 小数类型为 decimal，禁止使用 float 和 double。如果存储的数据范围超过 decimal 的范围，建议将数据拆成整数和小数并分开存储。<font color="red">如果存储的数据与金额（可能精确到分和角）相关，采用 int 或 bigint 存储格式。</font>
- 如果存储的字符串长度几乎相等，使用 char 定长字符串类型。
- varchar 是可变长字符串，不预先分配存储空间，长度不要超过 5000，如果存储长度大于此值，定义字段类型为 text，独立出来一张表，用主键来对应，避免影响其它字段索引率（如稿件的列表和正文）。
- 表必备字段：id，create_by（创建人ID），update_by（更新人ID），updated_at（记录被修改的时间），created_at（记录被创建的时间）：其中 id 必为主键，类型一般用 int unsigned、单表时自增（可使用默认步长），根据实际情况选择是否使用bigint；create_by，update_by 的类型均为 varchar(32)；updated_at，created_at 的类型均为 datetime。
- 字段允许适当冗余，以提高查询性能，但必须考虑数据一致。
- 在数据库中不能使用物理删除操作，要使用逻辑删除，例如：is_deleted。

:::tip
合适的字符存储长度，不但节约数据库表空间、节约索引存储，更重要的是提升检索速度。
:::

## 五、索引规约

:::danger 创建索引时避免有如下极端误解
- 索引宁滥勿缺。认为一个查询就需要建一个索引。
- 吝啬索引的创建。认为索引会消耗空间、严重拖慢记录的更新以及行的新增速度。
- 抵制唯一索引。认为唯一索引一律需要在应用层通过“先查后插”方式解决。
:::

:::tip
索引的区分度等于 COUNT (DISTINCT 具体的列) / COUNT (*) ，表示字段不重复的比例。 唯一键的区分度是1，而对于一些状态值，性别等字段区分度往往比较低，在数据量比较大的情况下，甚至有无限接近0。
:::

 - **主键索引名为 pk_字段名；唯一索引名为 uk_字段名；普通索引名则为 idx_字段名。**

> pk_即 primary key；uk_即 unique key；idx_即 index 的简称。

 - **业务上具有唯一特性的字段，即使是组合字段，也必须建成唯一索引**

> 不要以为唯一索引影响了 INSERT 速度，这个速度损耗可以忽略，但提高查找速度是明显的；另外，即使在应用层
做了非常完善的校验控制，只要没有唯一索引，根据墨菲定律，必然有脏数据产生。

- **超过三个表禁止 JOIN。需要 JOIN 的字段，数据类型保持绝对一致；多表关联查询时，保证被关联的字段需要有索引。**

> 即使双表 JOIN 也要注意表索引、SQL 性能。

- **在 varchar 字段上建立索引时，必须指定索引长度，没必要对全字段建立索引，根据实际文本区分度决定索引长度。**

> 索引的长度与区分度是一对矛盾体，一般对字符串类型数据，长度为 20 的索引，区分度会高达 90%以上，可以使
用 COUNT(DISTINCT LEFT(列名，索引长度)) / COUNT(*) 的区分度来确定。

- **LIKE 搜索严禁左模糊或者全模糊，如果需要请走搜索引擎来解决。**

> 索引文件具有 B-Tree 的最左前缀匹配特性，如果左边的值未确定，那么无法使用此索引。

- **如果有 ORDER BY 的场景，请注意利用索引的有序性。ORDER BY 最后的字段是组合索引的一部分，并且放在索引组合顺序的最后，避免出现 filesort 的情况，影响查询性能。**

> <font color="green">正例</font>：WHERE a = ? AND b = ? ORDER BY c；索引：a_b_c <br />
> <font color="red">反例</font>：索引如果存在范围查询，那么索引有序性无法利用，如：WHERE a > 10 ORDER BY b；索引 a_b 无法排序

- **利用覆盖索引来进行查询操作，避免回表。**

> 如果一本书需要知道第 11 章是什么标题，会翻开第 11 章对应的那一页吗？目录浏览一下就好，这个目录就是起
到覆盖索引的作用。

> <font color="green">正例</font>：能够建立索引的种类分为主键索引、唯一索引、普通索引三种，而覆盖索引只是一种查询的一种效果，用explain的结果，extra 列会出现：using index。

- **利用延迟关联或者子查询优化超多分页场景。**

> MySQL 并不是跳过 offset 行，而是取 offset+N 行，然后返回放弃前 offset 行，返回 N 行，那当 offset 特别大
的时候，效率就非常的低下，要么控制返回的总页数，要么对超过特定阈值的页数进行 SQL 改写。

> <font color="green">正例</font>：先快速定位需要获取的 id 段，然后再关联：SELECT t1.* FROM 表1 as t1 , (SELECT id FROM 表1 WHERE 条件 LIMIT 100000 , 20) AS t2 WHERE t1.id = t2.id

- **SQL 性能优化的目标：至少要达到 range 级别，要求是 ref 级别，如果可以是 const 最好。**

扫描方式由快到慢：system > const > eq_ref > ref > range > index > ALL

> 1）consts 单表中最多只有一个匹配行（主键或者唯一索引），在优化阶段即可读取到数据。
> 2）ref 指的是使用普通的索引（normal index）。<br />
> 3）range 对索引进行范围检索。

> <font color="red">反例</font>：EXPLAIN 表的结果，type = index，索引物理文件全扫描，速度非常慢，这个 index 级别比较 range 还低，与全表扫描是小巫见大巫

- **建组合索引的时候，区分度最高的在最左边。**

> 存在非等号和等号混合判断条件时，在建索引时，请把等号条件的列前置。如：WHERE c > ? AND d = ? 那么即使 c 的区分度更高，也必须把 d 放在索引的最前列，即建立组合索引 idx_d_c

>  <font color="green">正例</font>：如果 WHERE a = ? and b = ?，a 列的几乎接近于唯一值，那么只需要单建 idx_a 索引即可。

## 六、参考资料

- [Keywords and Reserved Words](https://dev.mysql.com/doc/refman/8.0/en/keywords.html)
- [Alibaba Java Coding Guidelines](https://github.com/alibaba/p3c)