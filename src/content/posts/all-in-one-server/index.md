---
title: 一服四用
published: 2025-11-24
description: "究竟有多绝望才能一台低配服务器运行四个服务"
image: "./cover.jpg"
tags: ["服务器", "技术"]
category: Tech
draft: false
series: 该博客搭建
ai: "本文介绍了一位开发者如何在仅有2核2G内存的低配置云服务器上，通过一系列极限优化手段，成功同时运行Nginx、FTP、Minecraft服务器和Hypixel加速器四个服务。优化的关键步骤包括：创建和配置swap交换文件以防止内存不足，使用静态网站以节约资源，部署轻量级代理，以及精细调整Java虚拟机参数和Minecraft服务器配置。文章最终证明，即便硬件条件有限，合理的配置和优化也能让服务器稳定承载多项任务。"
---

> 众所周知，一台2核2G的云服务器是绝对不能同时运行四个服务的...？
> 当然，如果真是这样，就不会有这篇文章了

# 一 服 四 用

在开始前，我要先介绍一下我运行的四个服务，没一个是没用的

1. Nginx（没错就是这个博客）
2. FTP（开anonymous但是没有写入权限，主要是下载，也方便配置）
3. Minecraft（究极优化服务器）
4. Hypixel加速（主要消耗带宽而不是资源）

我知道你们觉得这很离谱，但先别觉得离谱，先看看怎么实现的再说（

### 1. 终极系统优化

第一步是swapfile启动

```
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
```

但是我在做这一步时忘了一件事——fstab

```
apt install arch-install-scripts
genfstab -U / > /etc/fstab
```

手动编辑fstab又难又容易错，arch大法好

然后修改swap使用倾向

```
echo "vm.swappiness=10" | sudo tee -a /etc/sysctl.conf
```

### 2.终极网站优化

降低服务器消耗资源的最简单方法就是使用静态网页——没错这个博客就是

```
#这是build.sh参考，我在本地弄好博客编译了快捷上传，改掉root密码
#!/bin/bash
rm -rf dist
npm run build
sshpass -p "root密码" ssh -T root@wtada233.top "rm -rf /var/www/html/*"
sshpass -p "root密码" scp -r dist/* root@wtada233.top:/var/www/html/
```

现在服务器基本上只消耗带宽了

### 3.终极代理优化

使用minecraftspeedproxy这个轻量级的代理服务，可以自行Github

### 4.重头戏！Minecraft!

```
root@Wtada233:~# cat Minecraft/start.sh 
#!/bin/bash
#java -jar -Xms1G -Xmx1G -XX:+UseG1GC -XX:+UnlockExperimentalVMOptions -XX:MaxGCPauseMillis=100 -XX:+DisableExplicitGC -XX:TargetSurvivorRatio=90 -XX:G1NewSizePercent=50 -XX:G1MaxNewSizePercent=80 -XX:G1MixedGCLiveThresholdPercent=35 -XX:+AlwaysPreTouch -XX:+ParallelRefProcEnabled -Dusing.aikars.flags=mcflags.emc.gs server.jar nogui
#java -jar -Xms1G -Xmx1G -Xss512K -XX:+AggressiveOpts -XX:+UseCompressedOops -XX:+UseCMSCompactAtFullCollection -XX:+UseFastAccessorMethods -XX:ParallelGCThreads=4 -XX:+UseConcMarkSweepGC -XX:CMSFullGCsBeforeCompaction=2 -XX:CMSInitiatingOccupancyFraction=70 -XX:-DisableExplicitGC -XX:TargetSurvivorRatio=90 -jar server.jar nogui
java -Xms1G -Xmx1G -XX:+UseSerialGC -XX:MaxRAMPercentage=70 -XX:+DisableExplicitGC -XX:OnOutOfMemoryError="kill -9 %p" -jar server.jar --nogui
```

前面几个是我以前用的，感觉最后一个效果最好
建议装一些优化插件，然后在server.properties中设置max-tick-time为-1，关闭watchdog

```
#Minecraft server properties
#Sun Nov 23 15:04:12 CST 2025
allow-flight=false
allow-nether=true
broadcast-console-to-ops=true
broadcast-rcon-to-ops=true
debug=false
difficulty=hard
enable-command-block=true
enable-jmx-monitoring=false
enable-query=false
enable-rcon=false
enable-status=true
enforce-secure-profile=true
enforce-whitelist=false
entity-broadcast-range-percentage=100
force-gamemode=false
function-permission-level=2
gamemode=survival
generate-structures=true
generator-settings={}
hardcore=false
hide-online-players=false
initial-disabled-packs=
initial-enabled-packs=vanilla
level-name=Server
level-seed=
level-type=default
max-build-height=320
max-chained-neighbor-updates=-1
max-players=100
max-tick-time=-1
max-world-size=29999984
motd=§l§6Linuxfirmware §4的 §2土豆服务器§r
network-compression-threshold=1024
online-mode=false
op-permission-level=4
player-idle-timeout=0
prevent-proxy-connections=false
pvp=true
query.port=25565
rate-limit=0
rcon.password=
rcon.port=25575
require-resource-pack=false
resource-pack=
resource-pack-prompt=
resource-pack-sha1=
server-ip=
server-name=土豆服
server-port=25565
simulation-distance=10
snooper-enabled=true
spawn-animals=true
spawn-monsters=true
spawn-npcs=true
spawn-protection=16
sync-chunk-writes=true
text-filtering-config=
use-native-transport=true
view-distance=4
white-list=false
```

我的配置仅供参考，欢迎邮箱联系提出意见

### 5.总结

弄好之后swap的好处就有了——别听AI胡说八道说swap降低速度，实际上swap根本不是拿来当正常内存用的，就是防内存不够。弄好这套配置之后常年消耗5M左右swap，负载高的时候不超过512M，十分稳定
