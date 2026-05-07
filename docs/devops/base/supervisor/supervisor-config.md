# 应用程序配置



:::warning 注意
- 通过`/etc/supervisord.conf`配置文件 [include] 块中的`files`指令加载需要管理的服务项目配置文件
- 服务配置文件目录为`/etc/supervisord.d/`,后缀为`.ini`，不同项目通过目录名分类管理
  :::

配置文件目录结构示例：

```vim
/etc/
├── supervisord.conf
└── supervisord.d
    ├── programA
    │         ├── service1.ini
    │         └── service2.ini
    ├── programB
    │         ├── service1.ini
    │         └── service2.ini
    └── programC
        └── service1.ini
```

## Java 应用程序示例

```vim
[program:szd-java-life_demo-app]
command=/usr/local/jdk8/bin/java -jar -Xms512m -Xmx512m -Dserver.port=9901 -Dspring.profiles.active=prod /data/content/szd-java-life/demo-app/demo-app.jar
directory=/data/content/szd-java-life/demo-app/
autostart=true
startsecs=10
autorestart=unexpected
user=nginx
edirect_stderr=true
stdout_logfile_maxbytes=1024MB
stdout_logfile_backups=7
stdout_logfile=/data/logs/szd-java-life-demo-app.log
```

需要注意修改`program`名称、`command`需要执行的命令、`directory`工作目录以及`stdout_logfile`日志输出位置。

:::warning 注意
- 测试环境`-Xms`与`-Xmx`内存分配固定128m，生产环境固定512m，除非不够用才增加。
- 测试环境`stdout_logfile_backups`日志副本数只保留1个，生产环境保留7个。
  :::

其中，`program`命名规则为`[program:<项目名称>-<代码包名称>_<模块名称>]`。

## Shell 脚本示例

```vim
[program:gusuxing_php-admin_AdminOaMessageTask]
command=sh /data/content/gusuxing-PHP-admin/bin/admin_oa_message_task.sh start
environment=YII_ENV=test
autostart=true
startsecs=10
autorestart=true
user=root
redirect_stderr=true
stdout_logfile_maxbytes=1024MB
stdout_logfile_backups = 7
```

其中，`[program:xxx]`的命名规则为`[program:<项目名称>_<代码包名称>_<脚本名称(驼峰)>]`。

## 参数说明

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
