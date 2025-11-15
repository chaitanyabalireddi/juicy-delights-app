package app.lovable.acb7e439054c4128b372eee5635b1a92;

import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowInsetsController;
import android.view.WindowManager;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setupStatusBar();
    }
    
    @Override
    public void onResume() {
        super.onResume();
        // Apply status bar settings again when app resumes
        setupStatusBar();
    }
    
    private void setupStatusBar() {
        Window window = getWindow();
        
        // Ensure content doesn't go behind status bar
        WindowCompat.setDecorFitsSystemWindows(window, true);
        
        // Set white background for status bar
        window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
        window.setStatusBarColor(0xFFFFFFFF);
        
        // Try multiple methods to ensure dark icons work across all Android versions
        View decorView = window.getDecorView();
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            // Android 11+ (API 30+)
            WindowInsetsController controller = window.getInsetsController();
            if (controller != null) {
                controller.setSystemBarsAppearance(
                    WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS,
                    WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS
                );
            }
        }
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            // Android 6+ (API 23+) - Use legacy flag as well
            int flags = decorView.getSystemUiVisibility();
            flags |= View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
            decorView.setSystemUiVisibility(flags);
        }
        
        // Also use AndroidX compat library
        WindowInsetsControllerCompat compatController = 
            WindowCompat.getInsetsController(window, decorView);
        if (compatController != null) {
            compatController.setAppearanceLightStatusBars(true);
        }
    }
}
