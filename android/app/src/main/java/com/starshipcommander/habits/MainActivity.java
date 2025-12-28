package com.starshipcommander.habits;

import android.os.Bundle;
import android.view.View;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // 启用沉浸式模式 / Enable immersive mode
        // 允许内容延伸到系统 UI 区域下 / Allow content to extend under system UI areas
        enableImmersiveMode();

        // 优化 WebView 输入处理 / Optimize WebView input handling
        // 防止软键盘导致输入丢失 / Prevent keyboard from causing input loss
        configureWebView();
    }

    /**
     * 启用沉浸式模式
     * Enable immersive mode for fullscreen experience
     */
    private void enableImmersiveMode() {
        // 获取装饰视图 / Get decor view
        View decorView = getWindow().getDecorView();

        // 设置系统 UI 可见性 / Set system UI visibility
        // 使内容延伸到状态栏和导航栏下方
        // Extend content under status bar and navigation bar
        decorView.setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_LAYOUT_STABLE
            | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
            | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
        );

        // 设置透明状态栏 / Set transparent status bar
        getWindow().setStatusBarColor(android.graphics.Color.TRANSPARENT);

        // 设置透明导航栏 / Set transparent navigation bar
        getWindow().setNavigationBarColor(android.graphics.Color.TRANSPARENT);
    }

    /**
     * 配置 WebView 以优化输入体验
     * Configure WebView for optimal input experience
     */
    private void configureWebView() {
        try {
            WebView webView = getBridge().getWebView();
            if (webView != null) {
                // 启用平滑过渡 / Enable smooth transitions
                webView.setLayerType(WebView.LAYER_TYPE_HARDWARE, null);

                // 保留输入状态 / Preserve input state
                webView.setSaveEnabled(true);

                // 启用布局 inset / Enable layout insets
                // 这允许 safe-area-inset-* CSS 变量正常工作
                // This allows safe-area-inset-* CSS variables to work properly
                webView.setFitsSystemWindows(true);
            }
        } catch (Exception e) {
            // 忽略配置错误 / Ignore configuration errors
            e.printStackTrace();
        }
    }

    @Override
    public void onPause() {
        super.onPause();
        // 避免应用在后台时重置输入状态
        // Avoid resetting input state when app is in background
        try {
            WebView webView = getBridge().getWebView();
            if (webView != null) {
                // 保存 WebView 状态 / Save WebView state
                webView.saveState(Bundle.EMPTY);
            }
        } catch (Exception e) {
            // 忽略保存错误 / Ignore save errors
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        // 恢复应用时保持输入状态
        // Maintain input state when resuming app
    }
}
