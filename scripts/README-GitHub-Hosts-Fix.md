# GitHub Hosts File Fix

This script helps resolve GitHub connectivity issues caused by outdated IP addresses in the Windows hosts file.

## Problem
When you add GitHub IP mappings to your Windows hosts file, these IPs can become outdated over time. GitHub frequently changes its IP addresses, which can cause:
- GitHub websites not loading
- Slow connections to GitHub
- Issues with VS Code GitHub integration
- Problems with `git clone` and other Git operations

## Solution
The `fix-github-hosts.bat` script will:
1. **Backup** your current hosts file
2. **Restore** the default Windows hosts file (removes all custom GitHub entries)
3. **Flush DNS cache** to clear old entries
4. **Renew IP configuration** for a clean network state

## Usage

### Option 1: Run the automated script
1. Right-click on `scripts/fix-github-hosts.bat`
2. Select "Run as administrator" (required for hosts file modification)
3. Follow the on-screen instructions

### Option 2: Manual fix
If you prefer to fix manually:

1. **Open Command Prompt as Administrator**
2. **Navigate to hosts file location:**
   ```cmd
   cd C:\Windows\System32\drivers\etc
   ```

3. **Backup current hosts file:**
   ```cmd
   copy hosts hosts.backup
   ```

4. **Edit hosts file** with notepad:
   ```cmd
   notepad hosts
   ```

5. **Remove all GitHub-related entries** (lines containing github.com, githubusercontent.com, etc.)

6. **Save the file**

7. **Flush DNS cache:**
   ```cmd
   ipconfig /flushdns
   ipconfig /release
   ipconfig /renew
   ```

## Prevention
To avoid future issues:
- **Don't use static GitHub IPs** unless absolutely necessary
- If you must use GitHub IP mappings, regularly update them from trusted sources
- Consider using a VPN or DNS service instead of hosts file modifications

## Troubleshooting
If you still experience GitHub connectivity issues after running the fix:

1. **Restart your browser** completely
2. **Restart VS Code** or other development tools
3. **Check your firewall settings**
4. **Try using a different DNS server** (like 8.8.8.8 or 1.1.1.1)
5. **Restart your computer** for a complete network reset

## Files Created
- `hosts.backup.YYYYMMDD` - Backup of your original hosts file (in case you need to restore it)