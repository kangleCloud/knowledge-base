# Shell 编码规范（风格指南）

## 一、文件名

约定 shell 脚本使用 .sh 作为扩展名，且应该是可执行的（使用`chmod +x *.sh`设置可执行权限），文件名要求全部小写，文件名可使用连字符`-`。

:::tip 正确示例
- check-nginx.sh
- mysqld-log-output-zabbix.sh
- java-errlog-output-zabbix.sh
:::

## 二、环境

### 0x01.STDOUT vs STDERR

所有的错误信息都应被导向到STDERR，这样将有利于出现问题时快速区分正常输出和异常输出。

建议使用与以下函数类似的方式来打印正常和异常输出：

```bash
err() {
    echo "[$(date +'%FT%T%z')]: $@" >&2
}

if ! do_something; then
    err "Unable to do_something"
    exit "${E_DID_NOTHING}"
fi
```

## 三、注释

### 0x01.文件头

每个文件必须包含一个顶层注释，对其内容进行简要概述。

例如：
```vim
#!/bin/bash
#
# Mysql数据库冷备
```

### 0x02.功能注释

:::tip
所有的函数都必须注释，函数注释包含：
- 函数的描述
- 全局变量的使用
- 使用的参数说明
- 返回值（非上一条命令运行后默认的退出状态） 
:::

例如：
```vim
#!/bin/bash
#
# Perform hot backups of databases.

export PATH='/usr/sbin/bin:/usr/bin:/usr/local/bin'

#######################################
# Cleanup files from the backup dir
# Globals:
#   BACKUP_DIR
#   BACKUP_SID
# Arguments:
#   None
# Returns:
#   None
#######################################
cleanup() {
    ...
}
```

## 四、格式

### 0x01.缩进

每当开始一个新的块，缩进增加4个空格（不能使用\t字符来缩进）。对于已有文件，保持已有的缩进格式。

### 0x02.管道

如果一行容得下整个管道操作，约定将整个管道操作写在同一行。否则，应该将整个管道操作分割成每行一个管段，管道操作的下一部分应该将管道符放在新行并且缩进4个空格。这适用于使用管道符`|`的合并命令链以及使用`||`和`&&`的逻辑运算符。

:::tip 正确示例
```bash
# 单行管道连接，管道左右空格
command1 | command2

# 长命令管道换行连接，管道放置于下一个命令开头，缩进4个空格
command1 \
    | command2 \
    | command3 \
    | command4
```
:::

### 0x03.循环

约定将 `; do` , `; then` 和 `while`, `for`, `if`放在同一行。

shell 中的循环略有不同，但是我们遵循跟声明函数时的大括号相同的原则。即： `; do`, `; then` 应该和 while/for/if 放在同一行。`else`应该单独一行。 结束语句应该单独一行且跟开始语句缩进对齐。

:::tip 正确示例
```bash
for dir in ${dirs_to_cleanup}; do
    if [[ -d "${dir}/${BACKUP_SID}" ]]; then
        log_date "Cleaning up old files in ${dir}/${BACKUP_SID}"
        rm "${dir}/${BACKUP_SID}/"*
        if [[ "$?" -ne 0 ]]; then
            error_message
        fi
    else
        mkdir -p "${dir}/${BACKUP_SID}"
        if [[ "$?" -ne 0 ]]; then
            error_message
        fi
    fi
done
```
:::

### 0x04.case语句

通过4个空格缩进可选项。可选项中的多个命令应该被拆分成多行，模式表达式、操作和结束符`;;`在不同的行。匹配表达式比 case 和 esac 缩进一级。多行操作要再缩进一级。 模式表达式前面不应该出现左括号。避免使用 `;&` 和 `;;&` 符号。

:::tip 正确的多行示例
```bash
case "${expression}" in
    a)
        variable="..."
        some_command "${variable}" "${other_expr}" ...
        ;;
    absolute)
        actions="relative"
        another_command "${actions}" "${other_expr}" ...
        ;;
    *)
        error "Unexpected expression '${expression}'"
        ;;
esac
```
:::

只要整个表达式可读，简单的单行命令可以跟模式和 `;;` 写在同一行。当单行容不下操作时，约定使用多行的写法。

:::tip 正确的单行示例
```bash
verbose='false'
aflag=''
bflag=''
files=''
while getopts 'abf:v' flag; do
    case "${flag}" in
        a) aflag='true' ;;
        b) bflag='true' ;;
        f) files="${OPTARG}" ;;
        v) verbose='true' ;;
        *) error "Unexpected option ${flag}" ;;
    esac
done
```
:::

### 0x05.变量扩展

约定为变量加上大括号如 "${var}" 而不是 "$var" 

以下按照优先顺序列出建议：
- 与现有代码保持一致
- 单字符变量在特定情况下才需要被括起来
- 使用引号引用变量，参考“变量引用”章节

:::tip 正确示例说明
```bash
# 位置变量和特殊变量，可以不用大括号:
echo "Positional: $1" "$5" "$3"
echo "Specials: !=$!, -=$-, _=$_. ?=$?, #=$# *=$* @=$@ \$=$$ ..."

# 当位置变量大于等于10，则必须有大括号:
echo "many parameters: ${10}"

# 当出现歧义时，必须有大括号:
# Output is "a0b0c0"
set -- a b c
echo "${1}0${2}0${3}0"

# 使用变量扩展赋值时，必须有大括号：
DEFAULT_MEM=${DEFUALT_MEM:-"-Xms2g -Xmx2g -XX:MaxDirectMemorySize=4g"}

# 其他常规变量的推荐处理方式:
echo "PATH=${PATH}, PWD=${PWD}, mine=${some_var}"
while read f; do
    echo "file=${f}"
done < <(ls -l /tmp)
```
:::

:::danger 反例
```bash
# 无引号, 无大括号, 特殊变量，单字符变量
echo a=$avar "b=$bvar" "PID=${$}" "${1}"

# 无大括号产生歧义场景：以下会被解析为 "${1}0${2}0${3}0",
# 而非 "${10}${20}${30}
set -- a b c
echo "$10$20$30"
```
:::

### 0x06.变量引用

变量引用通常情况下应遵循以下原则：
- 默认情况下推荐使用引号引用包含变量、命令替换符、空格或shell元字符的字符串
- 在有明确要求必须使用无引号扩展的情况下，可不用引号
- 字符串为单词类型时才推荐用引号，而非命令选项或者路径名
- 不要对整数使用引号
- 特别注意`[[`模式匹配的引号规则
- 在无特殊情况下，推荐使用`$@`而非`$*`

:::tip 示例说明
```bash
# '单引号' 表示禁用变量替换
# "双引号" 表示需要变量替换

# 示例1： 命令替换需使用双引号
flag="$(some_command and its args "$@" 'quoted separately')"

# 示例2：常规变量需使用双引号
echo "${flag}"

# 示例3：整数不使用引号
value=32
# 示例4：即便命令替换输出为整数，也需要使用引号
number="$(generate_number)"

# 示例5：单词可以使用引号，但不作强制要求
readonly USE_INTEGER='true'

# 示例6：输出特殊符号使用单引号或转义
echo 'Hello stranger, and well met. Earn lots of $$$'
echo "Process $$: Done making \$\$\$."

# 示例7：命令参数及路径不需要引号
grep -li Hugo /dev/null "$1"

# 示例8：常规变量用双引号，ccs可能为空的特殊情况可不用引号
git send-email --to "${reviewers}" ${ccs:+"--cc" "${ccs}"}

# 示例9：正则用单引号，$1可能为空的特殊情况可不用引号
grep -cP '([Ss]pecial|\|?characters*)$' ${1:+"$1"}

# 示例10：位置参数传递推荐带引号的"$@"，所有参数作为单字符串传递用带引号的"$*"
# content of t.sh
func_t() {
    echo num: $#
    echo args: 1:$1 2:$2 3:$3
}

func_t "$@"
func_t "$*"
# 当执行 ./t.sh a b c 时输出如下：
num: 3
args: 1:a 2:b 3:c
num: 1
args: 1:a b c 2: 3:
```
:::

### 0x07.函数位置

将文件中所有的函数统一放在常量下面。只有`includes`，`set` 声明和常量设置可能在函数声明之前完成。不要在函数之间隐藏可执行代码。

### 0x08.主函数main

对于包含至少了一个其他函数的足够长的脚本，约定定义一个名为 main 的函数。对于功能简单的短脚本，main函数是没有必要的。

为了方便查找程序的入口位置，将主程序放入一个名为 main 的函数中，作为最底部的函数。这使其和代码库的其余部分保持一致性，同时允许你定义更多变量为局部变量（如果主代码不是一个函数就不支持这种做法）。 文件中最后的非注释行应该是对 main 函数的调用：

## 五、特性与错误

### 0x01.命令替换

使用`$(command)`而不是反引号。

因反引号如果要嵌套则要求用反斜杠转义内部的反引号。而`$(command)`形式的嵌套无需转义，且可读性更高。

:::tip 正确示例
```bash
var="$(command "$(command1)")"
```
:::

:::danger 错误示例
```bash
var="`command \`command1\``"
```
:::

### 0x02.条件测试

约定使用`[[ ... ]]`，而不是 `[`, `test` , 和 `/usr/bin/[` 。

因为在 `[[` 和 `]]` 之间不会出现路径扩展或单词切分，所以使用 `[[ ... ]]` 能够减少犯错。且 `[[ ... ]]` 支持正则表达式匹配，而 `[ ... ]` 不支持。

:::tip 示例说明
```bash
# 示例1：正则匹配，注意右侧没有引号
if [[ "filename" =~ ^[[:alnum:]]+name ]]; then
    echo "Match"
fi

# 示例2：严格匹配字符串"f*"(本例为不匹配)
if [[ "filename" == "f*" ]]; then
    echo "Match"
fi

# 示例3：[]中右侧不加引号将出现路径扩展，如果当前目录下有f开头的多个文件将报错[: too many arguments
if [ "filename" == f* ]; then
    echo "Match"
fi
```
:::

### 0x03.字符串测试

约定使用变量引用，而非字符串过滤。

Bash 可以很好的处理空字符串测试，约定使用空/非空字符串测试方法，而不是过滤字符，让代码具有更高的可读性。

:::tip 正确示例
```bash
# 测试字符串是否相等
if [[ "${my_var}" = "some_string" ]]; then
    do_something
fi

# 使用-z测试字符串为空
if [[ -z "${my_var}" ]]; then
    do_something
fi

# 使用-n测试非空字符串
if [[ -n "${my_var}" ]]; then
    do_something
fi
```
:::

:::danger 错误示例
```bash
# 测试字符串是否相等
if [[ "${my_var}X" = "some_stringX" ]]; then
    do_something
fi

# 使用空引号测试空字符串，能用但不推荐
if [[ "${my_var}" = "" ]]; then
    do_something
fi

# 测试字符串非空，能用但不推荐
if [[ "${my_var}" ]]; then
    do_something
fi
```

:::

### 0x04.文件名扩展

当进行文件名的通配符扩展时，请指定明确的路径。

当目录中有特殊文件名如以 `-` 开头的文件时，使用带路径的扩展通配符 `./*` 比不带路径的 `*` 要安全很多。

:::tip 示例说明
```bash
# 例如目录下有以下4个文件和子目录：
# -f  -r  somedir  somefile

# 未指定路径的通配符扩展会把-r和-f当作rm的参数，强制删除文件：
psa@bilby$ rm -v *
removed directory: `somedir'
removed `somefile'

# 而指定了路径的则不会:
psa@bilby$ rm -v ./*
removed `./-f'
removed `./-r'
rm: cannot remove `./somedir': Is a directory
removed `./somefile'
```
:::

### 0x05.禁用eval

`Eval` 在用于分配变量时会修改输入内容，但设置变量的同时并不能检查这些变量是什么。

:::danger 禁止使用
```bash
# 以下设置的内容及成功与否并不明确
eval $(set_my_variables)
```
:::

### 0x06.禁用管道导向while循环

约定使用进程替换或者`for`循环，而不是通过管道连接`while`循环。

这是因为在管道之后的`while`循环中，命令是在一个子`shell`中运行的，因此对变量的修改是不能传递给父`shell`的。

这种管道连接`while`循环中的隐式子`shell`使得 bug 定位非常困难。

:::danger 错误示例
```bash
last_line='NULL'
your_command | while read line; do
    last_line="${line}"
done

# 以下会输出'NULL'：
echo "${last_line}"
```
:::

如果你确定输入中不包含空格或者其他特殊符号（通常不是来自用户输入），则可以用`for`循环代替。

:::tip 正确示例说明
```bash
total=0
# 仅当返回结果中无空格等特殊符号时以下可正常执行：
for value in $(command); do
    total+="${value}"
done
```
:::

## 六、命名约定

### 0x01.函数名

约定函数名之后必须有圆括号，同时不建议在函数名前添加 function 关键字。

如果是单个函数，约定用小写字母来命名，并用下划线分隔单词。如果是一个包，约定使用双冒号 `::` 来分隔包名。 函数名和圆括号之间没有空格，大括号必须和函数名位于同一行。

:::tip 正确示例
```bash
# Single function
my_func() {
  ...
}

# Part of a package
mypackage::my_func() {
  ...
}
```
:::

:::danger 错误示例
```bash
function my_func
{
    ...
}
```
:::

### 0x02.变量名

使用小写字母，多个单词用下划线分隔单词。循环中的变量名应该和正在被循环的变量名保持相似的名称。

:::tip 正确示例
```bash
for zone in ${zones}; do
    something_with "${zone}"
done
```
:::

### 0x03.常量和环境变量名

全部大写，用下划线分隔，声明在文件的顶部。

### 0x04.只读变量

因为全局变量在 shell 中广泛使用，所以在使用它们的过程中捕获错误是很重要的。当你声明了一个变量，希望其只读，需要明确指出。

约定使用 `readonly` 或者 `declare -r` 来确保变量只读。

### 0x05.局部变量

必须使用 `local` 来声明局部变量，以确保其只在函数内部和子函数中可见。这样可以避免污染全局名称空间以及避免无意中设置可能在函数外部具有重要意义的变量。

当使用命令替换进行赋值时，变量声明和赋值必须分开。因为内建的 `local` 不会从命令替换中传递退出码。 

:::tip 正确示例
```bash
my_func2() {
    local name="$1"
    # 命令替换赋值，变量声明和赋值需放到不同行:
    local my_var
    my_var="$(my_func)" || return
    ...
}
```
:::

:::danger 错误示例
```bash
my_func2() {
    # 禁止以下写法: $? 将获取到'local'指令的返回值, 而非 my_func
    local my_var="$(my_func)"
    [[ $? -eq 0 ]] || return

    ...
}
```
:::

## 七、调用命令

### 0x01.检查返回值

总是检查返回值，且提供有用的返回值。

对于非管道命令，使用 `$?` 或直接通过 `if` 语句来检查以保持其简洁。

:::tip 示例说明
```bash
# 使用if语句判断执行结果
if ! mv "${file_list}" "${dest_dir}/" ; then
    echo "Unable to move ${file_list} to ${dest_dir}" >&2
    exit "${E_BAD_MOVE}"
fi

# 或者使用$?
mv "${file_list}" "${dest_dir}/"
if [[ $? -ne 0 ]]; then
    echo "Unable to move ${file_list} to ${dest_dir}" >&2
    exit "${E_BAD_MOVE}"
fi
```
:::

### 0x02.内建命令和外部命令

当内建命令可以完成相同的任务时，在 shell 内建命令和调用外部命令之间，约定选择内建命令。

因内建命令相比外部命令而言会产生更少的依赖，且多数情况调用内建命令比调用外部命令可以获得更好的性能（通常外部命令会产生额外的进程开销）。

:::tip 正确示例
```bash
# 使用内建的算术扩展
addition=$((${X} + ${Y}))
# 使用内建的字符串替换
substitution="${string/#foo/bar}"
```
:::

:::danger 错误示例
```bash
# 调用外部命令进行简单的计算
addition="$(expr ${X} + ${Y})"
# 调用外部命令进行简单的字符串替换
substitution="$(echo "${string}" | sed -e 's/^foo/bar/')"
```
:::

## 八、编程实践

### 0x01.文件加载

加载外部库文件不允许使用`.`，约定使用`source`，已提升可阅读性。

:::tip 正确示例
```bash
source my_libs.sh
```
:::

:::danger 错误示例
```bash
. my_libs.sh
```
:::

### 0x02.内容过滤与统计

除非必要情况，尽量使用单个命令及其参数组合来完成一项任务，而非多个命令加上管道的不必要组合。 常见的不建议的用法例如：cat和grep连用过滤字符串; cat和wc连用统计行数; grep和wc连用统计行数等。当然，最终还是以解决问题为目标。

:::tip 正确示例
```bash
grep net.ipv4 /etc/sysctl.conf
grep -c net.ipv4 /etc/sysctl.conf
wc -l /etc/sysctl.conf
```
:::

:::danger 错误示例
```bash
cat /etc/sysctl.conf | grep net.ipv4
grep net.ipv4 /etc/sysctl.conf | wc -l
cat /etc/sysctl.conf | wc -l
```
:::

### 0x03.正确使用返回与退出

除特殊情况外，几乎所有函数都不应该使用`exit`直接退出脚本，而应该使用`return`进行返回，以便后续逻辑中可以对错误进行处理。

:::tip 正确示例
```bash
# 当函数返回后可以继续执行cleanup
my_func() {
    [[ -e /dummy ]] || return 1
}

cleanup() {
    ...
}

my_func
cleanup
```
:::

:::danger 错误示例
```bash
# 当函数退出时，cleanup将不会被执行
my_func() {
    [[ -e /dummy ]] || exit 1
}

cleanup() {
    ...
}

my_func
cleanup
```
:::

## 九、参考资料

- https://zh-google-styleguide.readthedocs.io/en/latest/google-shell-styleguide
- https://google.github.io/styleguide/shellguide.html
- https://chegva.com/3977.html