# -*- mode: ruby -*-
# vi: set ft=ruby :
# https://docs.vagrantup.com
# https://github.com/maciakl/lamp
# http://stackoverflow.com/questions/24771595/vagrant-shell-provisioning-runs-but-fails

$script = <<SCRIPT
echo 'Updating Repositories'
apt-get update -qq
apt-get upgrade -qy

echo 'Installing Dependencies'
apt-get install -qy apache2 php5
SCRIPT

Vagrant.configure(2) do |config|
  config.vm.box = "ubuntu/trusty32"
  config.vm.network "forwarded_port", guest: 80, host: 8080
  config.vm.provision "shell", inline: $script
  config.vm.synced_folder "_site", "/var/www/html" # configure html root here
  config.ssh.shell = "bash -c 'BASH_ENV=/etc/profile exec bash'"
end
