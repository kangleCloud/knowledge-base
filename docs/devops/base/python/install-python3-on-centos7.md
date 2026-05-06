# 在Centos7上安装Python3

最新稳定版：https://www.python.org/downloads

:::warning 约定
- 源码包下载到 /usr/local/src 中
- 软件安装到 /usr/local 中，并以软件名及主次版本号命名，如 python2.9 或 python3.11
  :::

## 安装必要的库

```bash
yum -y install gcc gcc-c++ zlib-devel
```

## 升级OpenSSL

经团队多次验证，为了解决使用`pip3`安装软件出现的 "Can't connect to HTTPS URL because the SSL module is not available" 问题，需编译安装 openssl-1.1.1*（当前最新版为v1.1.1.t）。

安装文档：<a href="/docs/devops/base/server-os/upgrade-openssl.md" target="_blank">《在 CentOS 7 上升级 OpenSSL 到 1.1.1*》</a>

## 安装Python3

1、下载源代码并解压缩
```bash
cd /usr/local/src
wget https://www.python.org/ftp/python/3.11.3/Python-3.11.3.tar.xz
tar -Jxvf Python-3.11.3.tar.xz
```

2、编译安装
```bash
cd Python-3.11.3
./configure --prefix=/usr/local/python3.11 --with-openssl=/usr/local/openssl1.1 --enable-optimizations
make && make install
```
`--enable-optimizations`可以提高编译后的运行速度，但是在编译时会较慢

`--with-openssl=/usr/local/openssl1.1`解决`pip3`安装软件出现的 "Can't connect to HTTPS URL because the SSL module is not available" 问题。

3、配置环境变量
```bash
ln -s /usr/local/python3.11/bin/python3 /usr/bin/python3
ln -s /usr/local/python3.11/bin/pip3 /usr/bin/pip3
```

4、验证 Python3 和 Pip3
```bash
# 验证python
python3 -V
# 输出内容如下
Python 3.11.3

# 验证pip
pip3 -V
# 输出内容如下
pip 22.3.1 from /usr/local/python3.11/lib/python3.11/site-packages/pip (python 3.11)
```

## 常见错误

- 在编译安装 Python3 时，使用优化命令 `--enable-optimizations` 时会出现错误，错误内容如下：
:::danger

```vim
gcc -pthread     -o _bootstrap_python Modules/getbuildinfo.o Parser/token.o  Parser/pegen.o Parser/pegen_errors.o Parser/action_helpers.o Parser/parser.o Parser/string_parser.o Parser/peg_api.o Parser/myreadline.o Parser/tokenizer.o Objects/abstract.o Objects/accu.o Objects/boolobject.o Objects/bytes_methods.o Objects/bytearrayobject.o Objects/bytesobject.o Objects/call.o Objects/capsule.o Objects/cellobject.o Objects/classobject.o Objects/codeobject.o Objects/complexobject.o Objects/descrobject.o Objects/enumobject.o Objects/exceptions.o Objects/genericaliasobject.o Objects/genobject.o Objects/fileobject.o Objects/floatobject.o Objects/frameobject.o Objects/funcobject.o Objects/interpreteridobject.o Objects/iterobject.o Objects/listobject.o Objects/longobject.o Objects/dictobject.o Objects/odictobject.o Objects/memoryobject.o Objects/methodobject.o Objects/moduleobject.o Objects/namespaceobject.o Objects/object.o Objects/obmalloc.o Objects/picklebufobject.o Objects/rangeobject.o Objects/setobject.o Objects/sliceobject.o Objects/structseq.o Objects/tupleobject.o Objects/typeobject.o Objects/unicodeobject.o Objects/unicodectype.o Objects/unionobject.o Objects/weakrefobject.o Python/_warnings.o Python/Python-ast.o Python/Python-tokenize.o Python/asdl.o Python/ast.o Python/ast_opt.o Python/ast_unparse.o Python/bltinmodule.o Python/ceval.o Python/codecs.o Python/compile.o Python/context.o Python/dynamic_annotations.o Python/errors.o Python/frame.o Python/frozenmain.o Python/future.o Python/getargs.o Python/getcompiler.o Python/getcopyright.o Python/getplatform.o Python/getversion.o Python/hamt.o Python/hashtable.o Python/import.o Python/importdl.o Python/initconfig.o Python/marshal.o Python/modsupport.o Python/mysnprintf.o Python/mystrtoul.o Python/pathconfig.o Python/preconfig.o Python/pyarena.o Python/pyctype.o Python/pyfpe.o Python/pyhash.o Python/pylifecycle.o Python/pymath.o Python/pystate.o Python/pythonrun.o Python/pytime.o Python/bootstrap_hash.o Python/specialize.o Python/structmember.o Python/symtable.o Python/sysmodule.o Python/thread.o Python/traceback.o Python/getopt.o Python/pystrcmp.o Python/pystrtod.o Python/pystrhex.o Python/dtoa.o Python/formatter_unicode.o Python/fileutils.o Python/suggestions.o Python/dynload_shlib.o     Modules/config.o Modules/main.o Modules/gcmodule.o Modules/atexitmodule.o  Modules/faulthandler.o  Modules/posixmodule.o  Modules/signalmodule.o  Modules/_tracemalloc.o  Modules/_codecsmodule.o  Modules/_collectionsmodule.o  Modules/errnomodule.o  Modules/_io/_iomodule.o Modules/_io/iobase.o Modules/_io/fileio.o Modules/_io/bytesio.o Modules/_io/bufferedio.o Modules/_io/textio.o Modules/_io/stringio.o  Modules/itertoolsmodule.o  Modules/_sre/sre.o  Modules/_threadmodule.o  Modules/timemodule.o  Modules/_weakref.o  Modules/_abc.o  Modules/_functoolsmodule.o  Modules/_localemodule.o  Modules/_operator.o  Modules/_stat.o  Modules/symtablemodule.o  Modules/pwdmodule.o  Modules/xxsubtype.o \
        Programs/_bootstrap_python.o Modules/getpath.o -lpthread -ldl  -lutil                        -lm 
./Programs/_freeze_module zipimport ./Lib/zipimport.py Python/frozen_modules/zipimport.h
./_bootstrap_python ./Programs/_freeze_module.py abc ./Lib/abc.py Python/frozen_modules/abc.h
Fatal Python error: init_import_site: Failed to import the site module
Python runtime state: initialized
Traceback (most recent call last):
  File "/usr/local/src/Python-3.11.3/Lib/site.py", line 73, in <module>
    import os
  File "/usr/local/src/Python-3.11.3/Lib/os.py", line 29, in <module>
    from _collections_abc import _check_methods
SystemError: <built-in function compile> returned NULL without setting an exception
make[1]: *** [Python/frozen_modules/abc.h] 错误 1
make[1]: 离开目录“/usr/local/src/Python-3.11.3”
make: *** [profile-opt] 错误 2
```

:::

:::tip 解决方法
这是由于 CentOS 7.9 版本的 gcc4 版本的原因，解决办法为禁用优化或者升级当前的 gcc 版本

推荐使用 REDHAT 提供的开发工具包来管理 gcc 版本，这样做的好处是可以随时切换版本，同时可以存在多个版本，同时不会破坏原有的 gcc 环境

官网地址：[Red Hat Developer Toolset](https://access.redhat.com/documentation/en-us/red_hat_developer_toolset/12)

```bash
yum install centos-release-scl
yum install devtoolset-11
```

激活 gcc 版本

```bash
scl enable devtoolset-11 bash
# or
source /opt/rh/devtoolset-11/enable
```

通过 `gcc --version` 可以查看到 gcc 的版本已经切换为 11.2.1 版本，注意的是这个只会在当前 bash 内生效，如果需要永久生效，可以添加到环境变量

```bash
gcc --version

# 输出内容如下
gcc (GCC) 11.2.1 20220127 (Red Hat 11.2.1-9)
Copyright (C) 2021 Free Software Foundation, Inc.
This is free software; see the source for copying conditions.  There is NO
warranty; not even for MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
```

然后重新进行 python3 的编译安装
:::

## 参考资料

- https://github.com/python/cpython/issues/94825
- https://github.com/Homebrew/homebrew-core/pull/126485
