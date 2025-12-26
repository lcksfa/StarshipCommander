package com.starshipcommander.habits;

import android.os.Bundle;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // 优化 WebView 输入处理 / Optimize WebView input handling
        // 防止软键盘导致输入丢失 / Prevent keyboard from causing input loss
        configureWebView();
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
