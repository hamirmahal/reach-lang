import { execSync } from "child_process";

/*
https://docs.netlify.com/integrations/build-plugins/create-plugins/#anatomy-of-a-plugin
*/
export const onPreBuild = function() {
  console.info('Attempting to install Docker...');
  /*
  https://monovm.com/blog/sudo-command-not-found/#Fixing-Sudo-command-not-found-errors
  */
  // Fix "/bin/sh: 1: sudo: not found" error from Netlify
  execSync('su -');
  execSync('apt update');
  execSync('apt install apt-transport-https ca-certificates curl software-properties-common');
  execSync('curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -');
  execSync('add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu focal stable"');
  execSync('apt-cache policy docker-ce');
  execSync('apt install docker-ce');
  execSync('systemctl status docker');
  execSync('docker --version');

  console.info('Docker installed successfully...?');
}
