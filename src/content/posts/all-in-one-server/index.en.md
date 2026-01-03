---
title: "One Server, Four Uses"
og_theme: dark
published: 2025-11-24
description: "How desperate do you have to be to run four services on a low-end server?"
image: "./cover.jpg"
tags: ["Server", "Tech"]
category: Tech
draft: false
series: "Building This Blog"
ai: "This post describes how a developer successfully managed to run Nginx, FTP, a Minecraft server, and a Hypixel accelerator simultaneously on a budget VPS with only 2 cores and 2GB of RAM. Key optimization steps include configuring swap files, using static site generation, deploying lightweight proxies, and fine-tuning JVM parameters. The results prove that even with limited hardware, stability can be achieved through meticulous optimization."
---

> As everyone knows, a cloud server with 2 cores and 2GB of RAM absolutely cannot run four services at the same time... right?
> Of course, if that were true, this article wouldn't exist.

## O N E - S E R V E R - F O U R - U S E S

Before I start, let me introduce the four services I'm running—none of them are useless:

1.  **Nginx** (Yes, this blog itself)
2.  **FTP** (Anonymous enabled but without write permissions, mainly for downloads and easy configuration)
3.  **Minecraft** (Ultimate optimized server)
4.  **Hypixel Accelerator** (Mainly consumes bandwidth rather than system resources)

I know this sounds crazy, but let's see how it was implemented first.

### 1. Ultimate System Optimization

The first step is enabling the swapfile:

```bash
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
```

However, I forgot one thing during this step—`fstab`:

```bash
apt install arch-install-scripts
genfstab -U / > /etc/fstab
```

Manually editing `fstab` is difficult and error-prone; long live the Arch way.

Then, modify the swap usage tendency:

```bash
echo "vm.swappiness=10" | sudo tee -a /etc/sysctl.conf
```

### 2. Ultimate Website Optimization

The easiest way to reduce resource consumption is to use static web pages—and that's exactly what this blog is.

```bash
# This is a reference for build.sh
#!/bin/bash
rm -rf dist
npm run build
sshpass -p "password" ssh -T root@wtada233.top "rm -rf /var/www/html/*"
sshpass -p "password" scp -r dist/* root@wtada233.top:/var/www/html/
```

Now the server basically only consumes bandwidth.

### 3. Ultimate Proxy Optimization

Use `minecraftspeedproxy`, a lightweight proxy service. You can find it on GitHub.

### 4. The Main Event: Minecraft!

```bash
# Minecraft/start.sh
java -Xms1G -Xmx1G -XX:+UseSerialGC -XX:MaxRAMPercentage=70 -XX:+DisableExplicitGC -XX:OnOutOfMemoryError="kill -9 %p" -jar server.jar --nogui
```

I've used several others before, but this one seems to work best. I recommend installing some optimization plugins and setting `max-tick-time` to `-1` in `server.properties` to disable the watchdog.

### 5. Conclusion

Once set up, the benefits of swap become apparent—don't listen to the AI nonsense about swap slowing things down. In reality, swap isn't meant to be used as normal memory; it's there to prevent out-of-memory crashes. With this setup, it usually only consumes about 5MB of swap, staying below 512MB even under high load. Very stable.
