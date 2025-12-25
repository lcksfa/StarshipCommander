/**
 * 生成 Android 应用图标
 * Generate Android app icons from SVG source
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// SVG 源文件路径 / SVG source file path
const svgSource = path.join(__dirname, '../public/favicon.svg');
// 输出目录 / Output directory
const outputDir = path.join(__dirname, '../public/icons');

// Android 图标尺寸定义（遵循 Android 规范） / Android icon sizes (following Android guidelines)
const androidSizes = [
  // Adaptive Icon / 自适应图标
  { name: 'mipmap-anydpi-v26/ic_launcher', size: 108, foreground: true }, // 前景层
  { name: 'mipmap-anydpi-v26/ic_launcher_round', size: 108, foreground: true, round: true },

  // 标准图标 / Standard icons
  { name: 'mipmap-mdpi/ic_launcher', size: 48 }, // ~120dp
  { name: 'mipmap-mdpi/ic_launcher_round', size: 48, round: true },
  { name: 'mipmap-hdpi/ic_launcher', size: 72 }, // ~180dp
  { name: 'mipmap-hdpi/ic_launcher_round', size: 72, round: true },
  { name: 'mipmap-xhdpi/ic_launcher', size: 96 }, // ~240dp
  { name: 'mipmap-xhdpi/ic_launcher_round', size: 96, round: true },
  { name: 'mipmap-xxhdpi/ic_launcher', size: 144 }, // ~360dp
  { name: 'mipmap-xxhdpi/ic_launcher_round', size: 144, round: true },
  { name: 'mipmap-xxxhdpi/ic_launcher', size: 192 }, // ~480dp
  { name: 'mipmap-xxxhdpi/ic_launcher_round', size: 192, round: true },

  // 通知图标 / Notification icon
  { name: 'mipmap-xxxhdpi/ic_notification', size: 96 },

  // 网站图标 / Web icons
  { name: 'web/favicon-16x16', size: 16 },
  { name: 'web/favicon-32x32', size: 32 },
  { name: 'web/apple-touch-icon', size: 180 },
  { name: 'web/android-chrome-192x192', size: 192 },
  { name: 'web/android-chrome-512x512', size: 512 },
];

/**
 * 检查是否安装了 ImageMagick
 * Check if ImageMagick is installed
 */
function checkImageMagick() {
  try {
    execSync('convert -version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * 检查是否安装了 sharp
 * Check if sharp is installed
 */
function checkSharp() {
  try {
    require('sharp');
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * 使用 sharp 转换 SVG 到 PNG
 * Convert SVG to PNG using sharp
 */
async function convertWithSharp(svgPath, outputPath, size) {
  const sharp = require('sharp');
  await sharp(svgPath)
    .resize(size, size)
    .png()
    .toFile(outputPath);
  console.log(`✅ Generated: ${outputPath}`);
}

/**
 * 使用 ImageMagick 转换 SVG 到 PNG
 * Convert SVG to PNG using ImageMagick
 */
function convertWithImageMagick(svgPath, outputPath, size) {
  const command = `convert -background none -density 300 -resize ${size}x${size} "${svgPath}" "${outputPath}"`;
  execSync(command, { stdio: 'inherit' });
  console.log(`✅ Generated: ${outputPath}`);
}

/**
 * 使用 svglib 转换 SVG 到 PNG（纯 JavaScript 方案）
 * Convert SVG to PNG using svglib (pure JavaScript solution)
 */
async function convertWithSvglib(svgPath, outputPath, size) {
  const { createCanvas } = require('canvas');
  const { loadSvg } = require('svglib');

  const svgContent = fs.readFileSync(svgPath, 'utf8');
  const document = loadSvg(svgContent);

  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // 渲染 SVG 到 canvas
  document.render(ctx);

  // 保存为 PNG
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ Generated: ${outputPath}`);
}

/**
 * 主函数 / Main function
 */
async function main() {
  console.log('🚀 开始生成图标 / Starting icon generation...\n');

  // 创建输出目录 / Create output directories
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 检查可用的转换工具 / Check available conversion tools
  const hasImageMagick = checkImageMagick();
  const hasSharp = checkSharp();

  if (!hasImageMagick && !hasSharp) {
    console.error('❌ 错误：未找到 ImageMagick 或 sharp / Error: ImageMagick or sharp not found');
    console.log('\n请安装以下工具之一 / Please install one of the following tools:\n');
    console.log('选项 1 / Option 1: ImageMagick');
    console.log('  macOS:   brew install imagemagick');
    console.log('  Ubuntu:  sudo apt-get install imagemagick');
    console.log('  Windows: https://imagemagick.org/script/download.php\n');
    console.log('选项 2 / Option 2: sharp (推荐 / Recommended)');
    console.log('  pnpm add -D sharp canvas svglib\n');
    process.exit(1);
  }

  // 优先使用 sharp（更快）/ Prefer sharp (faster)
  const convertFn = hasSharp ? convertWithSharp : convertWithImageMagick;
  const converterName = hasSharp ? 'sharp' : 'ImageMagick';

  console.log(`📦 使用工具 / Using tool: ${converterName}\n`);

  // 生成图标 / Generate icons
  let successCount = 0;
  let failCount = 0;

  for (const icon of androidSizes) {
    try {
      const outputPath = path.join(outputDir, `${icon.name.replace(/\//g, '-')}.png`);
      const outputDirFull = path.dirname(outputPath);

      // 创建子目录 / Create subdirectory
      if (!fs.existsSync(outputDirFull)) {
        fs.mkdirSync(outputDirFull, { recursive: true });
      }

      // 转换图标 / Convert icon
      await convertFn(svgSource, outputPath, icon.size);
      successCount++;
    } catch (error) {
      console.error(`❌ Failed to generate ${icon.name}:`, error.message);
      failCount++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`✨ 完成 / Complete!`);
  console.log(`   成功 / Success: ${successCount}`);
  console.log(`   失败 / Failed: ${failCount}`);
  console.log('='.repeat(50));

  // 输出 Android 资源路径 / Output Android resource paths
  console.log('\n📱 Android 资源位置 / Android resource locations:\n');
  console.log('请将以下文件复制到 Android 项目：');
  console.log('Please copy the following files to your Android project:\n');

  androidSizes.filter(icon => !icon.name.startsWith('web')).forEach(icon => {
    const sourcePath = path.join(outputDir, `${icon.name.replace(/\//g, '-')}.png`);
    const targetPath = path.join('android/app/src/main/res', `${icon.name}.png`);
    console.log(`  ${sourcePath} → ${targetPath}`);
  });

  console.log('\n🌐 网站 / Web:\n');
  console.log('  favicon-16x16.png → public/favicon-16x16.png');
  console.log('  favicon-32x32.png → public/favicon-32x32.png');
  console.log('  apple-touch-icon.png → public/apple-touch-icon.png');
  console.log('  android-chrome-*.png → public/android-chrome-*.png\n');
}

main().catch(error => {
  console.error('❌ 发生错误 / Error occurred:', error);
  process.exit(1);
});
