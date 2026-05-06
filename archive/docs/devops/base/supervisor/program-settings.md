# 应用程序配置

:::tip
Supervisord 通过 /etc/supervisord.conf 中 [include] 块的 files 设置加载服务配置。具体配置存放于 /etc/supervisord.d/ 目录，文件格式为 .ini，推荐使用子目录实现项目的分类管理。
:::

配置文件目录结构示例：

```vim
/etc/
├── supervisord.conf
└── supervisord.d
    ├── programA
    │   ├── service1.ini
    │   └── service2.ini
    ├── programB
    │   ├── service1.ini
    │   └── service2.ini
    └── programC
        └── service1.ini
```

## Java应用程序示例

```vim
[program:$Program]
command=/usr/local/jdk8/bin/java -jar -Xms512m -Xmx512m -Dserver.port=9901 -Dspring.profiles.active=prod /path/to/project/application.jar
autostart=true
startsecs=10
autorestart=unexpected
user=nginx
edirect_stderr=true
stdout_logfile_maxbytes=1024MB
stdout_logfile_backups=7
stdout_logfile=/var/log/supervisor/application.log
```

:::warning
 - 测试环境`-Xms`与`-Xmx`内存默认分配为128M，生产环境按需配置。
 - 测试环境`stdout_logfile_backups`日志副本数只保留1个，生产环境保留7个。
:::

## Shell脚本示例

```vim
[program:$Program]
command=sh /path/to/project/bin/sample.sh start
autostart=true
startsecs=10
autorestart=true
user=root
redirect_stderr=true
stdout_logfile_maxbytes=64MB
stdout_logfile_backups=7
stdout_logfile=/var/log/supervisor/application.log
```

## 参数说明

### 0x01.关键参数说明

- program - 指定监控的程序名称，在Supervisor中唯一标识（`program`命名规则为`[program:<项目名称>-<代码包名称>_<模块名称>]`）
- command - 指定要执行的命令
- directory - 设置工作目录（如果command中的文件路径是绝对路径，可不设置）
- stdout_logfile - 标准输出日志文件配置

### 0x02.配置文件中的参数说明

来源：supervisord.conf

```vim
; The sample program section below shows all possible program subsection values.
; Create one or more 'real' program: sections to be able to control them under
; supervisor.

;[program:theprogramname]
;command=/bin/cat              ; the program (relative uses PATH, can take args)
;process_name=%(program_name)s ; process_name expr (default %(program_name)s)
;numprocs=1                    ; number of processes copies to start (def 1)
;directory=/tmp                ; directory to cwd to before exec (def no cwd)
;umask=022                     ; umask for process (default None)
;priority=999                  ; the relative start priority (default 999)
;autostart=true                ; start at supervisord start (default: true)
;startsecs=1                   ; # of secs prog must stay up to be running (def. 1)
;startretries=3                ; max # of serial start failures when starting (default 3)
;autorestart=unexpected        ; when to restart if exited after running (def: unexpected)
;exitcodes=0                   ; 'expected' exit codes used with autorestart (default 0)
;stopsignal=QUIT               ; signal used to kill process (default TERM)
;stopwaitsecs=10               ; max num secs to wait b4 SIGKILL (default 10)
;stopasgroup=false             ; send stop signal to the UNIX process group (default false)
;killasgroup=false             ; SIGKILL the UNIX process group (def false)
;user=chrism                   ; setuid to this UNIX account to run the program
;redirect_stderr=true          ; redirect proc stderr to stdout (default false)
;stdout_logfile=/a/path        ; stdout log path, NONE for none; default AUTO
;stdout_logfile_maxbytes=1MB   ; max # logfile bytes b4 rotation (default 50MB)
;stdout_logfile_backups=10     ; # of stdout logfile backups (0 means none, default 10)
;stdout_capture_maxbytes=1MB   ; number of bytes in 'capturemode' (default 0)
;stdout_events_enabled=false   ; emit events on stdout writes (default false)
;stdout_syslog=false           ; send stdout to syslog with process name (default false)
;stderr_logfile=/a/path        ; stderr log path, NONE for none; default AUTO
;stderr_logfile_maxbytes=1MB   ; max # logfile bytes b4 rotation (default 50MB)
;stderr_logfile_backups=10     ; # of stderr logfile backups (0 means none, default 10)
;stderr_capture_maxbytes=1MB   ; number of bytes in 'capturemode' (default 0)
;stderr_events_enabled=false   ; emit events on stderr writes (default false)
;stderr_syslog=false           ; send stderr to syslog with process name (default false)
;environment=A="1",B="2"       ; process environment additions (def no adds)
;serverurl=AUTO                ; override serverurl computation (childutils)
```