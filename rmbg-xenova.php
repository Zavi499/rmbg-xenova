<?php
/**
 * Plugin Name: Background Remover - Xenova Modnet
 * Plugin URI: https://github.com/Zavi499/rmbg-xenova
 * Description: Remove image backgrounds using AI-powered Xenova/Modnet model. Privacy-focused with client-side processing - images never leave the user's browser.
 * Version: 1.0.0
 * Author: Zavi499
 * Author URI: https://github.com/Zavi499
 * License: MIT
 * Text Domain: rmbg-xenova
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('RMBG_XENOVA_VERSION', '1.0.0');
define('RMBG_XENOVA_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('RMBG_XENOVA_PLUGIN_URL', plugin_dir_url(__FILE__));

class RMBG_Xenova {

    /**
     * Constructor
     */
    public function __construct() {
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_shortcode('rmbg_xenova', array($this, 'render_shortcode'));
    }

    /**
     * Enqueue scripts and styles
     */
    public function enqueue_scripts() {
        // Only enqueue if shortcode is present
        global $post;
        if (is_a($post, 'WP_Post') && has_shortcode($post->post_content, 'rmbg_xenova')) {
            // Enqueue custom CSS
            wp_enqueue_style(
                'rmbg-xenova-style',
                RMBG_XENOVA_PLUGIN_URL . 'assets/css/rmbg-style.css',
                array(),
                RMBG_XENOVA_VERSION
            );

            // Enqueue custom JavaScript
            wp_enqueue_script(
                'rmbg-xenova-processor',
                RMBG_XENOVA_PLUGIN_URL . 'assets/js/rmbg-processor.js',
                array(),
                RMBG_XENOVA_VERSION,
                true
            );

            // Add module type attribute to the script
            add_filter('script_loader_tag', array($this, 'add_module_type'), 10, 3);

            // Pass data to JavaScript
            wp_localize_script('rmbg-xenova-processor', 'rmbgXenovaData', array(
                'ajaxUrl' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('rmbg-xenova-nonce'),
                'modelName' => 'Xenova/modnet',
            ));
        }
    }

    /**
     * Add type="module" to processor script
     */
    public function add_module_type($tag, $handle, $src) {
        if ('rmbg-xenova-processor' === $handle) {
            $tag = '<script type="module" src="' . esc_url($src) . '" id="' . esc_attr($handle) . '-js"></script>';
        }
        return $tag;
    }

    /**
     * Render shortcode
     */
    public function render_shortcode($atts) {
        $atts = shortcode_atts(array(
            'title' => 'AI Background Remover',
            'max_width' => '800px',
        ), $atts);

        ob_start();
        ?>
        <div class="rmbg-xenova-container" style="max-width: <?php echo esc_attr($atts['max_width']); ?>;">
            <div class="rmbg-header">
                <h2 class="rmbg-title"><?php echo esc_html($atts['title']); ?></h2>
                <p class="rmbg-subtitle">Remove image backgrounds instantly with AI - 100% private, processed on your device</p>
            </div>

            <!-- First-time info notice -->
            <div class="rmbg-info-notice" id="rmbgInfoNotice">
                <div class="rmbg-info-icon">🔒</div>
                <div class="rmbg-info-content">
                    <strong>Privacy First!</strong>
                    <p>The AI model will be downloaded to your device on first use (approximately 40MB). This is a one-time download that ensures your images are processed locally in your browser - they never touch our servers!</p>
                </div>
                <button class="rmbg-info-close" onclick="this.parentElement.style.display='none'">×</button>
            </div>

            <!-- Model Loading Progress -->
            <div class="rmbg-model-loading" id="rmbgModelLoading" style="display: none;">
                <div class="rmbg-loading-content">
                    <div class="rmbg-spinner"></div>
                    <h3>Loading AI Model...</h3>
                    <p id="rmbgModelStatus">Initializing...</p>
                    <div class="rmbg-progress-bar">
                        <div class="rmbg-progress-fill" id="rmbgModelProgress"></div>
                    </div>
                    <span class="rmbg-progress-text" id="rmbgModelProgressText">0%</span>
                </div>
            </div>

            <!-- Upload Section -->
            <div class="rmbg-upload-section" id="rmbgUploadSection">
                <div class="rmbg-upload-area" id="rmbgUploadArea">
                    <input type="file" id="rmbgFileInput" accept="image/*" style="display: none;">
                    <div class="rmbg-upload-icon">📸</div>
                    <h3>Drop your image here</h3>
                    <p>or click to browse</p>
                    <span class="rmbg-upload-hint">Supports JPG, PNG, WebP</span>
                </div>
            </div>

            <!-- Processing Section -->
            <div class="rmbg-processing-section" id="rmbgProcessingSection" style="display: none;">
                <div class="rmbg-loading-content">
                    <div class="rmbg-spinner"></div>
                    <h3>Removing Background...</h3>
                    <p>Processing your image with AI</p>
                    <div class="rmbg-progress-bar">
                        <div class="rmbg-progress-fill" id="rmbgProcessProgress"></div>
                    </div>
                    <span class="rmbg-progress-text" id="rmbgProcessProgressText">0%</span>
                </div>
            </div>

            <!-- Result Section -->
            <div class="rmbg-result-section" id="rmbgResultSection" style="display: none;">
                <div class="rmbg-comparison">
                    <div class="rmbg-image-container">
                        <h4>Original</h4>
                        <img id="rmbgOriginalImage" alt="Original Image">
                    </div>
                    <div class="rmbg-image-container">
                        <h4>Background Removed</h4>
                        <div class="rmbg-transparent-bg">
                            <canvas id="rmbgResultCanvas"></canvas>
                        </div>
                    </div>
                </div>

                <div class="rmbg-actions">
                    <button class="rmbg-btn rmbg-btn-primary" id="rmbgDownloadBtn">
                        <span>⬇</span> Download Image
                    </button>
                    <button class="rmbg-btn rmbg-btn-secondary" id="rmbgNewImageBtn">
                        <span>🔄</span> Process Another Image
                    </button>
                </div>
            </div>

            <!-- Error Section -->
            <div class="rmbg-error-section" id="rmbgErrorSection" style="display: none;">
                <div class="rmbg-error-content">
                    <div class="rmbg-error-icon">⚠️</div>
                    <h3>Oops! Something went wrong</h3>
                    <p id="rmbgErrorMessage"></p>
                    <button class="rmbg-btn rmbg-btn-secondary" id="rmbgRetryBtn">
                        <span>🔄</span> Try Again
                    </button>
                </div>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }
}

// Initialize the plugin
new RMBG_Xenova();
