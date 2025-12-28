#!/usr/bin/env node

/**
 * Starship Commander - Android Icon Generator (Node.js)
 * 从 SVG 生成 Android 应用图标 / Generate Android app icons from SVG
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 颜色输出 / Color output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  header: (msg) => {
    console.log(`\n${colors.cyan}========================================${colors.reset}`);
    console.log(`${colors.cyan}${msg}${colors.reset}`);
    console.log(`${colors.cyan}========================================${colors.reset}\n`);
  },
};

// Android 图标尺寸配置 / Android icon sizes configuration
const ICON_SIZES = [
  { dir: 'mipmap-mdpi', size: 48 },
  { dir: 'mipmap-hdpi', size: 72 },
  { dir: 'mipmap-xhdpi', size: 96 },
  { dir: 'mipmap-xxhdpi', size: 144 },
  { dir: 'mipmap-xxxhdpi', size: 192 },
];

// 检查依赖 / Check dependencies
function checkDependencies() {
  log.header('🔍 检查依赖 / Checking Dependencies');

  try {
    execSync('convert --version', { stdio: 'ignore' });
    log.success('ImageMagick 已安装 / ImageMagick installed');
    return true;
  } catch (error) {
    log.error('未找到 ImageMagick / ImageMagick not found');
    log.info('请安装 ImageMagick: / Please install ImageMagick:');
    log.info('  macOS: brew install imagemagick');
    log.info('  Ubuntu: sudo apt-get install imagemagick');
    return false;
  }
}

// 使用 sharp 生成图标 / Generate icons using sharp (备选方案 / alternative)
async function generateWithSharp() {
  log.header('🎨 使用 Sharp 生成图标 / Generating Icons with Sharp');

  try {
    // 动态导入 sharp / Dynamic import of sharp
    const sharp = require('sharp');

    const sourceSvg = path.join(__dirname, '..', 'public', 'favicon.svg');
    const androidResDir = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res');

    // 检查源文件 / Check source file
    if (!fs.existsSync(sourceSvg)) {
      log.error(`找不到源图标 / Source icon not found: ${sourceSvg}`);
      return false;
    }

    log.info(`源图标 / Source icon: ${sourceSvg}`);
    log.info(`目标目录 / Target directory: ${androidResDir}`);

    // 为每个尺寸生成图标 / Generate icons for each size
    for (const { dir, size } of ICON_SIZES) {
      const targetDir = path.join(androidResDir, dir);

      // 创建目录（如果不存在）/ Create directory if not exists
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      log.info(`生成 / Generating ${dir} (${size}x${size})...`);

      try {
        // 生成普通图标 / Generate regular icon
        await sharp(sourceSvg)
          .resize(size, size)
          .png()
          .toFile(path.join(targetDir, 'ic_launcher.png'));

        // 生成圆角图标 / Generate rounded icon
        await sharp(sourceSvg)
          .resize(size, size)
          .png()
          .toFile(path.join(targetDir, 'ic_launcher_round.png'));

        // 生成 adaptive icon 前景（大 25%）/ Generate adaptive icon foreground (25% larger)
        const adaptiveSize = Math.floor(size * 4 / 3);
        await sharp(sourceSvg)
          .resize(adaptiveSize, adaptiveSize)
          .png()
          .toFile(path.join(targetDir, 'ic_launcher_foreground.png'));

        log.success(`${dir} 完成 / completed`);
      } catch (error) {
        log.error(`生成 ${dir} 失败 / Failed to generate ${dir}: ${error.message}`);
      }
    }

    return true;
  } catch (error) {
    log.warning(`Sharp 不可用 / Sharp not available: ${error.message}`);
    return false;
  }
}

// 使用 ImageMagick 生成图标 / Generate icons using ImageMagick
function generateWithImageMagick() {
  log.header('🎨 使用 ImageMagick 生成图标 / Generating Icons with ImageMagick');

  const sourceSvg = path.join(__dirname, '..', 'public', 'favicon.svg');
  const androidResDir = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res');

  // 检查源文件 / Check source file
  if (!fs.existsSync(sourceSvg)) {
    log.error(`找不到源图标 / Source icon not found: ${sourceSvg}`);
    return false;
  }

  log.info(`源图标 / Source icon: ${sourceSvg}`);
  log.info(`目标目录 / Target directory: ${androidResDir}`);

  // 为每个尺寸生成图标 / Generate icons for each size
  for (const { dir, size } of ICON_SIZES) {
    const targetDir = path.join(androidResDir, dir);

    // 创建目录（如果不存在）/ Create directory if not exists
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    log.info(`生成 / Generating ${dir} (${size}x${size})...`);

    try {
      // 生成普通图标 / Generate regular icon
      execSync(
        `convert -background none -density 300 -resize ${size}x${size} "${sourceSvg}" "${path.join(targetDir, 'ic_launcher.png')}"`,
        { stdio: 'ignore' }
      );

      // 生成圆角图标 / Generate rounded icon
      execSync(
        `convert -background none -density 300 -resize ${size}x${size} "${sourceSvg}" "${path.join(targetDir, 'ic_launcher_round.png')}"`,
        { stdio: 'ignore' }
      );

      // 生成 adaptive icon 前景（大 25%）/ Generate adaptive icon foreground (25% larger)
      const adaptiveSize = Math.floor(size * 4 / 3);
      execSync(
        `convert -background none -density 300 -resize ${adaptiveSize}x${adaptiveSize} "${sourceSvg}" "${path.join(targetDir, 'ic_launcher_foreground.png')}"`,
        { stdio: 'ignore' }
      );

      log.success(`${dir} 完成 / completed`);
    } catch (error) {
      log.error(`生成 ${dir} 失败 / Failed to generate ${dir}`);
    }
  }

  return true;
}

// 验证图标 / Verify icons
function verifyIcons() {
  log.header('✅ 验证图标 / Verifying Icons');

  const androidResDir = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res');
  let count = 0;

  for (const { dir } of ICON_SIZES) {
    const targetDir = path.join(androidResDir, dir);
    if (fs.existsSync(targetDir)) {
      const files = fs.readdirSync(targetDir).filter(f => f.startsWith('ic_launcher') && f.endsWith('.png'));
      count += files.length;
    }
  }

  log.success(`共生成 / Total generated: ${count} 个图标文件 / icon files`);
}

// 主函数 / Main function
async function main() {
  log.header('🚀 Starship Commander - Android 图标生成器 / Icon Generator');

  // 检查是否需要清理 / Check if clean is needed
  if (process.argv.includes('--clean')) {
    log.header('🧹 清理旧图标 / Cleaning Old Icons');
    const androidResDir = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res');

    for (const { dir } of ICON_SIZES) {
      const targetDir = path.join(androidResDir, dir);
      if (fs.existsSync(targetDir)) {
        log.info(`清理 / Cleaning ${dir}...`);
        const files = fs.readdirSync(targetDir).filter(f => f.startsWith('ic_launcher') && f.endsWith('.png'));
        files.forEach(f => fs.unlinkSync(path.join(targetDir, f)));
      }
    }

    log.success('旧图标已清理 / Old icons cleaned');
  }

  // 尝试使用 Sharp / Try using Sharp first
  const sharpSuccess = await generateWithSharp();

  // 如果 Sharp 不可用，使用 ImageMagick / If Sharp not available, use ImageMagick
  if (!sharpSuccess) {
    const hasImageMagick = checkDependencies();
    if (!hasImageMagick) {
      log.error('没有可用的图标生成工具 / No icon generation tool available');
      log.info('请安装 Sharp 或 ImageMagick: / Please install Sharp or ImageMagick:');
      log.info('  npm install sharp');
      log.info('  brew install imagemagick');
      process.exit(1);
    }

    generateWithImageMagick();
  }

  // 验证图标 / Verify icons
  verifyIcons();

  log.header('🎉 完成！/ Completed!');
  log.info('下一步 / Next steps:');
  console.log('  1. 检查生成的图标 / Check generated icons');
  console.log('  2. 构建 Android APK / Build Android APK');
  console.log('     cd android && ./gradlew assembleRelease');
  console.log('');
}

// 运行主函数 / Run main function
main().catch((error) => {
  log.error(error.message);
  process.exit(1);
});
