"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseScraper = void 0;
class BaseScraper {
    constructor(options = {}) {
        this.browser = null;
        this.context = null;
        this.page = null;
        this.options = {
            headless: true,
            maxPages: 3,
            delay: 2000,
            timeout: 30000,
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            ...options
        };
    }
    async initializeBrowser() {
        const puppeteer = await Promise.resolve().then(() => __importStar(require('puppeteer')));
        this.browser = await puppeteer.launch({
            headless: this.options.headless ? 'shell' : false,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        this.context = await this.browser.createBrowserContext();
        this.page = await this.context.newPage();
        await this.page.setUserAgent(this.options.userAgent);
        await this.page.setViewport({ width: 1366, height: 768 });
    }
    async delay(ms = this.options.delay) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    async safeNavigate(url) {
        if (!this.page) {
            await this.initializeBrowser();
            if (!this.page)
                throw new Error('Failed to initialize page');
        }
        try {
            await this.page.goto(url, {
                waitUntil: 'networkidle2',
                timeout: this.options.timeout
            });
            await this.delay();
            return true;
        }
        catch (error) {
            console.error(`Error navigating to ${url}:`, error);
            return false;
        }
    }
    async close() {
        if (this.page)
            await this.page.close();
        if (this.context)
            await this.context.close();
        if (this.browser)
            await this.browser.close();
    }
}
exports.BaseScraper = BaseScraper;
