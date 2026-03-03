/**
 * Antigravity Workflow System - Assets Sync Script
 * -----------------------------------------------
 * 此脚本用于在发布前从项目根目录同步最新的文档和工作流模板到 anws 包中。
 * 确保 GitHub 首页与 npm 安装包中的内容完全一致。
 */

const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '../../..');
const PACKAGE_DIR = path.resolve(__dirname, '..');

const SYNC_CONFIG = [
  { from: 'README.md', to: 'README.md' },
  { from: 'README_CN.md', to: 'README_CN.md' },
  { from: '.agent', to: 'templates/.agent' }
];

console.log('🔄 Starting assets synchronization...');

for (const item of SYNC_CONFIG) {
  const src = path.join(ROOT_DIR, item.from);
  const dest = path.join(PACKAGE_DIR, item.to);

  if (!fs.existsSync(src)) {
    console.warn(`⚠️ Source not found, skipping: ${src}`);
    continue;
  }

  // 计算相对路径用于打印输出
  const relDest = path.relative(PACKAGE_DIR, dest);

  try {
    // 使用 Node.js 原始 cpSync 实现递归同步 (Node 16.7+)
    fs.cpSync(src, dest, { 
      recursive: true, 
      force: true,
      // 排除 .git 和一些不需要打进模板的临时文件 (如有)
      filter: (src) => !src.includes('.git') && !src.includes('.DS_Store')
    });
    console.log(`✅ Synced: ${item.from} -> ${relDest}`);
  } catch (err) {
    console.error(`❌ Failed to sync ${item.from}:`, err.message);
    process.exit(1);
  }
}

console.log('✨ All assets are synchronized and ready for publication.');
