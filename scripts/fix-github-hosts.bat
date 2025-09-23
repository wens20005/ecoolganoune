@echo off
:: Fix GitHub Hosts File Script
:: This script will backup the current hosts file,
:: restore the default Windows hosts file,
:: flush DNS cache, and reset network configuration.

echo ==========================================
echo     Fixing GitHub Hosts File on Windows
echo ==========================================

:: Step 1: Backup current hosts file
echo Backing up current hosts file...
set backup_path=%SystemRoot%\System32\drivers\etc\hosts.backup
copy %SystemRoot%\System32\drivers\etc\hosts %backup_path% >nul
echo Backup created at: %backup_path%

:: Step 2: Restore default hosts file
echo Restoring default hosts file...
(
echo # Copyright (c) 1993-2009 Microsoft Corp.
echo #
echo # This is a sample HOSTS file used by Microsoft TCP/IP for Windows.
echo #
echo # This file contains the mappings of IP addresses to host names.
echo # Each entry should be kept on an individual line. The IP address should
echo # be placed in the first column followed by the corresponding host name.
echo # The IP address and the host name should be separated by at least one
echo # space.
echo #
echo # Additionally, comments (such as these) may be inserted on individual
echo # lines or following the machine name denoted by a '#' symbol.
echo #
echo # For example:
echo #
echo #      102.54.94.97     rhino.acme.com          # source server
echo #       38.25.63.10     x.acme.com              # x client host
echo #
echo # localhost name resolution is handled within DNS itself.
echo #   127.0.0.1       localhost
echo #   ::1             localhost
) > %SystemRoot%\System32\drivers\etc\hosts

echo Default hosts file restored successfully.

:: Step 3: Flush DNS cache
echo Flushing DNS cache...
ipconfig /flushdns

:: Step 4: Reset network configuration
echo Resetting network configuration...
ipconfig /renew

echo ==========================================
echo All done! GitHub connectivity issues fixed.
echo ==========================================

pause